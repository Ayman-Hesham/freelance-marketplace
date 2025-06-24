import { ErrorWithStatus } from '../types/error.types';

interface RankingResult {
  ranking: Array<{
    id: string;
    rank: number;
  }>;
}

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_API_KEY = "AIzaSyAl3zgJaK71jfjDfHFtV2_UnfGUjDe64rQ"

async function generateResponse(
  prompt: string,
  model = "gemini-2.0-flash",
  temperature = 0.3,
  maxTokens = 5000,
  systemMessage: string
): Promise<any> {
  if (!GEMINI_API_KEY) {
    const error: ErrorWithStatus = new Error('GEMINI_API_KEY not set in environment variables');
    error.status = 500;
    throw error;
  }
1
  try {
    const combinedPrompt = `${systemMessage}\n\n${prompt}`;

    const url = `${GEMINI_BASE_URL}/${model}:generateContent`;
    const headers = {
      'Content-Type': 'application/json'
    };

    const params = new URLSearchParams({
      key: GEMINI_API_KEY
    });

    const data = {
      contents: [
        {
          parts: [
            {
              text: combinedPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: maxTokens
      }
    };

    const response = await fetch(`${url}?${params}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const geminiResponse = await response.json() as { candidates: Array<{ content: { parts: Array<{ text: string }> }, text: string }> };

    if (geminiResponse.candidates && geminiResponse.candidates.length > 0) {
      const candidate = geminiResponse.candidates[0];
      let content;

      if (candidate.content && candidate.content.parts) {
        content = candidate.content.parts[0].text;
      } else if (candidate.text) {
        content = candidate.text;
      } else {
        throw new Error('Unexpected response format from Gemini API');
      }

      return {
        choices: [
          {
            message: {
              content: content
            }
          }
        ]
      };
    } else {
      throw new Error('No candidates in response');
    }
  } catch (error: any) {
    console.error(`Error making request to Gemini API: ${error.message}`);
    throw error;
  }
}

export async function rankApplications(jobDescription: string, applications: Array<{ id: string, coverLetter: string }>): Promise<RankingResult> {
  const jobRankingSystem = "You are a job application ranking AI. Analyze cover letters against job requirements and return a JSON ranking response. Be concise and direct. Always return valid JSON format.";
  
  const prompt = `
    Rank applicants from best (1) to worst based on: technical skills match, experience level, project relevance.

    **Required JSON Output Format:**
    \`\`\`json
    {
    "ranking": [
        {"id": "ID_HERE", "rank": 1},
        {"id": "ID_HERE", "rank": 2},
        {"id": "ID_HERE", "rank": 3}
    ]
    }
    \`\`\`

    ---

    Job Description:
    ${jobDescription}

    ---

    Applications to Rank:

    \`\`\`json
    {
    "applications": ${JSON.stringify(applications, null, 2)}
    }
    \`\`\`

    Task: Return JSON ranking of applications by ID from best to worst fit for the job requirements.`;

  try {
    const response = await generateResponse(
      prompt,
      "gemini-2.0-flash",
      0.3,
      5000,
      jobRankingSystem
    );

    if (response?.choices?.[0]?.message?.content) {
      const content = response.choices[0].message.content;
      const jsonMatch = content.match(/\{.*\}/s);
      
      if (jsonMatch) {
        const parsedJson = JSON.parse(jsonMatch[0]);
        return parsedJson;
      }
    }
    
    throw new Error('Failed to parse ranking response');
  } catch (error) {
    console.error('Error ranking applications:', error);
    throw error;
  }
}
