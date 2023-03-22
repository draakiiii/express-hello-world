const prompt = "You are an artificial intelligence that creates prompts for the Midjourney image AI. Compose a simple text that includes the provided elements to generate the final image. You must send the response in ENGLISH, it is very important. Also, it doesn't have to be a very long text";
const chat = "You are an AI that engages in a normal conversation with a human. Respond to the user's message in a natural and human-like manner, without appearing as an AI. Responde todo en el idioma adecuado para la conversacion";
const teach = "You are an AI designed to teach tasks to users based on their instructions. Listen carefully to the user's input and provide guidance to help them perform the task as accurately as possible. Responde todo en el idioma adecuado para la conversacion";
const idea_generator = "You are an AI that generates creative ideas based on user input. Provide unique and innovative ideas in response to the user's request. Responde todo en el idioma adecuado para la conversacion";
const writing_style_reviewer = "You are an AI that reviews and provides feedback on writing style. Analyze the user's text and offer suggestions for improvement. Responde todo en el idioma adecuado para la conversacion";

const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/prompts', (req, res) => {
    res.render('prompts');
});

app.get('/chat', (req, res) => {
    res.render('chat');
});

app.get('/teach', (req, res) => {
    res.render('teach');
});

async function callOpenAI(message, system_content) {
    const openai_api_key = process.env.OPENAI_API_KEY;
    const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: system_content },
                { role: "user", content: message },
            ],
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openai_api_key}`,
            },
        }
    );
    return response.data.choices[0].message.content;
}

app.post('/api/:subpath', async (req, res) => {
    const message = req.body.message;
    const subpath = req.params.subpath;
    let system_content;

    if (subpath === 'prompts') {
        system_content = prompt;
    } else if (subpath === 'chat') {
        system_content = chat;
    } else if (subpath === 'teach') {
        system_content = teach;
    } else if (subpath === 'idea_generator') {
        system_content = idea_generator;
    } else if (subpath === 'writing_style_reviewer') {
        system_content = writing_style_reviewer;
    } else {
        return res.status(404).json({ error: 'Invalid URL' });
    }

    try {
        const reply = await callOpenAI(message, system_content);
        res.json({ reply });
    } catch (error) {
        res.status(500).json({ error: 'API call failed' });
    }
});

async function getTextEmbeddings(text) {
  try {
    const openai_api_key = process.env.OPENAI_API_KEY;
    const response = await axios.post(
      "https://api.openai.com/v1/embeddings",
      {
        model: "text-embedding-ada-002",
        input: text,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openai_api_key}`,
        },
      }
    );

    const embeddings = response.data.data[0].embedding;
    return embeddings;
  } catch (error) {
    console.error("Error getting text embeddings:", error);
    return null;
  }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
app.use(express.static('public'));
