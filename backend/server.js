require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");
const querystring = require("querystring");
const axios = require("axios");
const getSpotifyAccessToken = require("./spotify");
const getLyrics = require("./musixmatch");
const { calculateUserMoodScores } = require("./calculateUserMoodScores");
const { determineMoodFromLyrics, calculateMoodScores, determineMood } = require("./moodAnalyzer");
const calculateDistance = require("./calculateDistance");
const { fetchSpotifyTrackId } = require('./spotifyService');
const app = express(); 

const allowedOrigins = [process.env.FRONTEND_URL];
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

app.use(
      cors({
        origin: function (origin, callback) {
          if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        credentials: true,
      })
);

app.use(express.json());
app.use(bodyParser.json());

const prisma = new PrismaClient();

app.get("/spotify-token", async (req, res) => {
    const accessToken = await getSpotifyAccessToken();
    if (accessToken) {
        res.json({ accessToken });
    } else {
        res.status(500).json({ error: "Failed to fetch access token" });
    }
});

app.get("/login", (req, res) => {
    const scope = "user-read-private user-read-email";
    const authUrl =
        "https://accounts.spotify.com/authorize?" +
        querystring.stringify({
            response_type: "code",
            client_id: clientId,
            scope: scope,
            redirect_uri: redirectUri,
        });
    res.redirect(authUrl);
});

app.get("/callback", async (req, res) => {
    const code = req.query.code || null;
    const authOptions = {
        url: "https://accounts.spotify.com/api/token",
        form: {
            code: code,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
        },
        headers: {
            Authorization:
                "Basic " +
                Buffer.from(clientId + ":" + clientSecret).toString("base64"),
        },
        json: true,
    };

    try {
        const response = await axios.post(
            authOptions.url,
            querystring.stringify(authOptions.form),
            { headers: authOptions.headers }
        );
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;
        res.redirect(
            `${process.env.FRONTEND_URL}/callback#access_token=${accessToken}&refresh_token=${refreshToken}`
        );
    } catch (error) {
        res.status(500).json({ error: "Failed to authenticate with Spotify" });
    }
});

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendVerificationEmail = async (email, username, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify/${token}`;
    const emailText = `Hello ${username}, please verify your email by clicking on the link: ${verificationUrl}`;
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify your email",
        text: emailText,
    });
};

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Port number is : ${PORT}`);
    console.log('what is going on');
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.post("/signup", async (req, res) => {
    console.log("Signup endpoint hit!");
    const { username, email, password } = req.body;
    try {
        console.log("Received signup request:", { username, email, password });

        const existingUserByUsername = await prisma.user.findUnique({
            where: { username },
        });
        if (existingUserByUsername) {
            return res.status(400).json({ error: "Username already taken" });
        }

        const existingUserByEmail = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUserByEmail) {
            return res.status(400).json({ error: "Email already registered" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });
        const verificationToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        await sendVerificationEmail(email, username, verificationToken);
        res
            .status(201)
            .json({ message: "User created. Please verify your email." });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ error: "User could not be created." });
    }
});

app.post("/test", (req, res) => {
    res.json({ message: "Test route working" });
});


app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        console.log("Got here 1");
        const user = await prisma.user.findFirst({ where: { username } });
        if (!user) {
            return res.status(403).json({ status: "bad username/password" });
        }
        console.log("Got here 2", {user});
        // const match = await bcrypt.compare(password, user.password);
        let match = false;
        if (password === user.password) {match = true;}
        console.log("Got here: ", {match, username, password});
        if (match) {
            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );
            const userId = user.id;
            res.status(201).json({ status: "logged in", token, userId });
        } else {
            res.status(403).json({ status: "bad username/password" });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

app.post("/verify-email", async (req, res) => {
    const { token } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await prisma.user.update({
            where: { id: decoded.id },
            data: { isVerified: true },
        });
        res.status(200).json({ message: "Email verified successfully." });
    } catch (error) {
        res.status(400).json({ error: "Invalid or expired token." });
    }
});

app.get('/user/:userId', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(req.params.userId) },
            select: { username: true }
        });
        res.json(user);
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/lyrics", async (req, res) => {
    const { trackName, artistName } = req.query;

    if (!trackName || !artistName) {
        return res
            .status(400)
            .json({ error: "trackName and artistName are required" });
    }
    try {
        const lyrics = await getLyrics(trackName, artistName);
        if (lyrics) {
            res.json({ lyrics });
        } else {
            res.status(404).json({ error: "Lyrics not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/add-song", async (req, res) => {
    const { title, artist } = req.body;

    try {
        const lyrics = await getLyrics(title, artist);
        if (!lyrics) {
            return res.status(404).json({ error: "Lyrics not found" });
        }

        const songMoodScores = determineMoodFromLyrics(lyrics);
        const mood = Object.keys(songMoodScores).reduce((a, b) => songMoodScores[a] > songMoodScores[b] ? a : b);

        const accessToken = await getSpotifyAccessToken();
        if (!accessToken) {
            return res.status(500).json({ error: "Failed to obtain Spotify access token" });
        }

        const spotifyId = await fetchSpotifyTrackId(accessToken, title, artist);
        if (!spotifyId) {
            console.warn("No Spotify ID found");
        }

        const song = await prisma.song.create({
            data: {
                title,
                artist,
                lyrics,
                mood,
                songMoodScores: songMoodScores,
                spotifyId: spotifyId || null,
            },
        });

        res.status(201).json({ song });
    } catch (error) {
        console.error("Error adding song:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

app.get('/recommendations', async (req, res) => {
    const { userId } = req.query;

    try {
        const userAnswer = await prisma.userAnswer.findFirst({
            where: { userId: +userId },
            orderBy: { createdAt: 'desc' },
        });

        if (!userAnswer) {
            return res.status(404).json({ error: 'User answer not found' });
        }

        const mood = userAnswer.mood;

        const songs = await prisma.song.findMany({
            where: { mood },
            select: {
                id: true,
                title: true,
                artist: true,
                spotifyId: true,
            },
        });

        for (let song of songs) {
            if (!song.spotifyId) {
                const spotifyId = await fetchSpotifyTrackId(song.title, song.artist);
                if (spotifyId) {
                    await prisma.song.update({
                        where: { id: song.id },
                        data: { spotifyId },
                    });
                    song.spotifyId = spotifyId;
                }
            }
        }

        res.json({ mood, songs });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/update-spotify-ids", async (req, res) => {
    try {
        const accessToken = await getSpotifyAccessToken();
        if (!accessToken) {
            return res.status(500).json({ error: "Failed to obtain Spotify access token" });
        }

        const songs = await prisma.song.findMany({
            where: {
                spotifyId: null,
            },
        });

        for (const song of songs) {
            const spotifyId = await fetchSpotifyTrackId(song.title, song.artist, accessToken);
            if (spotifyId) {
                await prisma.song.update({
                    where: { id: song.id },
                    data: { spotifyId },
                });
            }
        }

        res.json({ message: "Spotify IDs updated successfully" });
    } catch (error) {
        console.error("Error updating Spotify IDs:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/submit-answers", async (req, res) => {
    try {
        const { userId, answers, questions } = req.body;
        const user = await prisma.user.findUnique({ where: { id: parseInt(userId, 10) } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const userMoodScores = calculateUserMoodScores(answers);
        const predominantMood = determineMood(userMoodScores);

        await prisma.user.update({
            where: { id: user.id },
            data: { userMoodScores: userMoodScores },
        });

        const userAnswer = await prisma.userAnswer.create({
            data: {
                userId: user.id,
                mood: predominantMood,
                answers: {
                    create: answers.map((answer, index) => ({
                        question: questions[index],
                        answer: `${answer}`,
                    })),
                },
            },
        });

        res.status(201).json({ message: "Answers submitted successfully" });
    } catch (error) {
        console.error("Internal Server Error", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/search", async (req, res) => {
    const { query, moods, artists, excludeMoods } = req.query;

    try {
        const moodArray = moods ? moods.split(",") : [];
        const artistArray = artists ? artists.split(",") : [];
        const excludeMoodArray = excludeMoods ? excludeMoods.split(",") : [];
        const searchConditions = [];

        if (query) {
            searchConditions.push({
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { artist: { contains: query, mode: "insensitive" } },
                    { lyrics: { contains: query, mode: "insensitive" } },
                ],
            });
        }

        if (artistArray.length > 0) {
            searchConditions.push({ artist: { in: artistArray } });
        }

        if (moodArray.length > 0) {
            searchConditions.push({ mood: { in: moodArray } });
        }

        if (excludeMoodArray.length > 0) {
            searchConditions.push({ mood: { notIn: excludeMoodArray } });
        }

        const songs = await prisma.song.findMany({
            where: {
                AND: searchConditions,
            },
        });

        // Shuffle the results
        const shuffledSongs = songs.sort(() => Math.random() - 0.5);

        res.json(shuffledSongs);
    } catch (error) {
        console.error("Error fetching search results:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/personalized-search", async (req, res) => {
    const { userId, query, moods, artists, excludeMoods } = req.query;

    try {
        const user = await prisma.user.findUnique({ where: { id: parseInt(userId, 10) } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const userMoodScores = user.userMoodScores;

        const searchConditions = [];

        if (query) {
            searchConditions.push({
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { artist: { contains: query, mode: "insensitive" } },
                    { lyrics: { contains: query, mode: "insensitive" } },
                ],
            });
        }

        if (artists) {
            searchConditions.push({ artist: { in: artists.split(",") } });
        }

        if (moods) {
            searchConditions.push({ mood: { in: moods.split(",") } });
        }

        if (excludeMoods) {
            searchConditions.push({ mood: { notIn: excludeMoods.split(",") } });
        }

        const songs = await prisma.song.findMany({
            where: {
                AND: searchConditions,
            },
        });

        const rankedSongs = songs.map(song => {
            const distance = calculateDistance(userMoodScores, song.songMoodScores);
            return { ...song, distance };
        }).sort((a, b) => a.distance - b.distance);

        res.json(rankedSongs);
    } catch (error) {
        console.error("Error fetching personalized search results:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/artists", async (req, res) => {
    try {
        const artists = await prisma.song.findMany({
            distinct: ["artist"],
            select: { artist: true },
        });
        res.json(artists.map((a) => a.artist));
    } catch (error) {
        console.error("Error fetching artists:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/moods", async (req, res) => {
    try {
        const moods = await prisma.song.findMany({
            distinct: ["mood"],
            select: { mood: true },
        });
        res.json(moods.map((m) => m.mood));
    } catch (error) {
        console.error("Error fetching moods:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/user/:userId/playlist", async (req, res) => {
    const { userId } = req.params;

    try {
        const userAnswers = await prisma.userAnswer.findMany({
            where: { userId: parseInt(userId, 10) },
            include: { answers: true },
        });

        const songs = await prisma.song.findMany({
            where: {
                mood: {
                    in: userAnswers.map((answer) => answer.mood),
                },
            },
        });

        res.json(songs);
    } catch (error) {
        console.error("Error fetching playlist:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});