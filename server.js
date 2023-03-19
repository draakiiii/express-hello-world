
const oldprompt = "You are an artificial intelligence that creates prompts for the Midjourney image AI. Compose a simple text that includes the provided elements to generate the final image. You must send the response in ENGLISH, it is very important. It must be a very short output";
const oldstory_prompt = "You are an artificial intelligence that creates prompts for the Midjourney image AI based on user-provided stories. Compose a simple text that includes elements from the user's story to generate the final image. You must send the response in ENGLISH, it is very important. It must be a very short output";
const oldchat = "You are an AI that engages in a normal conversation with a human. Respond to the user's message in a natural and human-like manner, without appearing as an AI. Responde todo en el idioma adecuado para la conversacion";
const oldteach = "You are an AI designed to teach tasks to users based on their instructions. Listen carefully to the user's input and provide guidance to help them perform the task as accurately as possible. Responde todo en el idioma adecuado para la conversacion";
const oldidea_generator = "You are an AI that generates creative ideas based on user input. Provide unique and innovative ideas in response to the user's request. Responde todo en el idioma adecuado para la conversacion";
const oldwriting_style_reviewer = "You are an AI that reviews and provides feedback on writing style. Analyze the user's text and offer suggestions for improvement. Responde todo en el idioma adecuado para la conversacion";
const oldhaiku_generator = "You are an AI that generates Haikus based on user input. Create a Haiku that follows the 5-7-5 syllable pattern in response to the user's request. Responde todo en el idioma adecuado para la conversacion";
const oldinteractive_storytelling = "You are an AI that creates interactive storytelling for role-playing games. Develop engaging narratives and scenarios based on the user's input. Responde todo en el idioma adecuado para la conversacion";
const oldnovel_index_generator = "You are an AI that generates novel indices based on user input. Create an index for the book with chapter numbers, chapter names, and a summary of what will happen in each chapter, given the user's idea, genre, and book size. Format the output correctly. After the first request, the user can ask the assistant to write the chapter they indicate. You must write the chapter with the title and the story based on the summary made at the beginning. Responde todo en el idioma adecuado para la conversacion";

const prompt = "Create a simple text for the Midjourney image AI using provided elements. Response must be in English and very short.";
const story_prompt = "Pretend to be Story2PromptAI (S2P). S2P takes stories and turns them into prompts for generative AIs that create images. Ask the user for a story, provide a prompt in a copyable code-box, and offer three different prompt options or a new story. Maintain the style throughout the conversation, asking the user for their preferred style or basing it on examples.";
const chat = "Engage in a normal conversation with a human. Responde naturalmente en el idioma del usuario";
const teach = "Teach tasks to users based on their instructions, providing guidance Responde naturalmente en el idioma del usuario";
const idea_generator = "Generate creative ideas based on user input, Responde naturalmente en el idioma del usuario";
const writing_style_reviewer = "Review and provide feedback on writing style, offering suggestions for improvement Responde naturalmente en el idioma del usuario";
const haiku_generator = "Generate Haikus based on user input, following the 5-7-5 syllable pattern and Responde naturalmente en el idioma del usuario";
const interactive_storytelling = "Create interactive storytelling for role-playing games based on user input, Responde naturalmente en el idioma del usuario";
const novel_index_generator = "Generate novel indices based on user input, creating chapters and summaries Responde naturalmente en el idioma del usuario";

const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const textArray = [];
const chatArray = [];
let embeddingsArray = [];

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/gpt4', (req, res) => {
    res.render('gpt4');
});

app.get('/chat', (req, res) => {
    res.render('chat');
});

app.get('/teach', (req, res) => {
    res.render('teach');
});

async function callOpenAI(message, system_content, similarTextsAndChats, model) {
    const openai_api_key = process.env.OPENAI_API_KEY;

    // Add user content for each text in the similarTextsAndChats array
    const userMessages = similarTextsAndChats.similarTexts.map(text => ({ role: "user", content: text }));
    const assistantMessages = similarTextsAndChats.similarChats.map(chat => ({ role: "assistant", content: chat }));
    
    // Combine userMessages and assistantMessages, alternating user and assistant messages
    const messages = userMessages.flatMap((userMessage, index) => [userMessage, assistantMessages[index]]);

    // Add baseMessages at the end of the messages array
    messages.push({ role: "system", content: system_content });
    messages.push({ role: "user", content: message });

    const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
            model: model,
            messages: messages,
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

    app.post('/gpt3/:subpath', async (req, res) => {
        const inputMessage = req.body.message;
        const similarTextsAndChats = await getSimilarTextsAndChats(req.body.message, textArray, chatArray);
        const subpath = req.params.subpath;
        let system_content;
        textArray.push(inputMessage);
switch (subpath) {
    case 'prompts':
        system_content = prompt;
        break;
    case 'chat':
        system_content = chat;
        break;
    case 'teach':
        system_content = teach;
        break;
    case 'idea_generator':
        system_content = idea_generator;
        break;
    case 'writing_style_reviewer':
        system_content = writing_style_reviewer;
        break;
    case 'haiku_generator':
        system_content = haiku_generator;
        break;
    case 'interactive_storytelling':
        system_content = interactive_storytelling;
        break;
        case 'novel_index_generator':
        system_content = novel_index_generator;
        break;
        case 'story_prompt':
        system_content = story_prompt;
        break;
    default:
        return res.status(404).json({ error: 'Invalid URL' });
}
        try {
            const reply = await callOpenAI(inputMessage, system_content, similarTextsAndChats, "gpt-3.5-turbo");
            chatArray.push(reply);
                       res.json({ reply });
        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            res.status(500).json({ error: 'API call failed' });
        }
    });

// Add a new route to clear all conversations (empty the arrays)
app.get('/clear', (req, res) => {
    textArray.length = 0;
    chatArray.length = 0;
    embeddingsArray.length = 0;
    res.send('All conversations have been cleared.');
    console.log('All conversations have been cleared. ' + textArray)
});

app.post('/gpt4/:subpath', async (req, res) => {
        const inputMessage = req.body.message;
        const similarTextsAndChats = await getSimilarTextsAndChats(req.body.message, textArray, chatArray);
        const subpath = req.params.subpath;
        let system_content;        textArray.push(inputMessage);
        switch (subpath) {
    case 'prompts':
        system_content = prompt;
        break;
    case 'chat':
        system_content = chat;
        break;
    case 'teach':
        system_content = teach;
        break;
    case 'idea_generator':
        system_content = idea_generator;
        break;
    case 'writing_style_reviewer':
        system_content = writing_style_reviewer;
        break;
    case 'haiku_generator':
        system_content = haiku_generator;
        break;
    case 'interactive_storytelling':
        system_content = interactive_storytelling;
        break;
        case 'novel_index_generator':
        system_content = novel_index_generator;
        break;
        case 'story_prompt':
        system_content = story_prompt;
        break;
    default:
        return res.status(404).json({ error: 'Invalid URL' });
}
        try {
            const reply = await callOpenAI(inputMessage, system_content, similarTextsAndChats, "gpt-4-0314");
            chatArray.push(reply);
                       res.json({ reply });
        } catch (error) {
            console.error('Error calling OpenAI API:', error);
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

function cosineSimilarity(embedding1, embedding2) {
  const dotProduct = embedding1.reduce((sum, a, i) => sum + a * embedding2[i], 0);
  const magnitude1 = Math.sqrt(embedding1.reduce((sum, a) => sum + a * a, 0));
  const magnitude2 = Math.sqrt(embedding2.reduce((sum, a) => sum + a * a, 0));
  return dotProduct / (magnitude1 * magnitude2);
}

async function getSimilarTexts(inputText, textArray, similarityThreshold = 0.75) {
  const inputEmbedding = await getTextEmbeddings(inputText);
  if (embeddingsArray.length < textArray.length) {
    const newText = textArray[textArray.length - 1];
    const newEmbedding = await getTextEmbeddings(newText);
    embeddingsArray.push(newEmbedding);
  }
  const similarities = embeddingsArray.map(embedding => cosineSimilarity(inputEmbedding, embedding));
  const similarIndices = similarities.reduce((indices, similarity, index) => {
    if (similarity > similarityThreshold) {
      indices.push(index);
    }
    return indices;
  }, []);
  console.log("text array: " + textArray);
  console.log("chat array: " + chatArray);
  console.log("similarities: " + similarities);
  console.log("similar indices: " + similarIndices);
  return similarIndices;
}

async function getSimilarTextsAndChats(inputText, textArray, chatArray, similarityThreshold = 0.75) {
  const similarIndices = await getSimilarTexts(inputText, textArray, similarityThreshold);
  const similarTexts = similarIndices.map(index => textArray[index]);
  const similarChats = similarIndices.map(index => chatArray[index]);
  return { similarTexts, similarChats };
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
app.use(express.static('public'));
