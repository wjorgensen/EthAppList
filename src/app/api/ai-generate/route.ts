import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, field, context } = await request.json();
    
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    
    if (!openRouterApiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    // Try primary model first, then fallback
    const models = ['google/gemini-2.5-flash', 'anthropic/claude-3-haiku'];
    let lastError = null;

    for (const model of models) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'EthAppList Content Generator',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant that generates high-quality content for Web3/Ethereum projects. Always respond with just the requested content, no extra formatting or explanations.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error(`OpenRouter API error with ${model}:`, errorData);
          
          try {
            const errorJson = JSON.parse(errorData);
            lastError = errorJson;
            if (errorJson.error?.code === 429) {
              // Rate limited, try next model
              continue;
            }
          } catch (e) {
            // Can't parse error, try next model
            continue;
          }
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();

        if (!content) {
          continue; // Try next model
        }

        return NextResponse.json({ content });

      } catch (error) {
        console.error(`Error with model ${model}:`, error);
        lastError = error;
        continue; // Try next model
      }
    }

    // If we get here, all models failed
    let errorMessage = 'All AI models are currently unavailable. Please try again later.';
    if (lastError && lastError.error?.code === 429) {
      errorMessage = 'AI services are temporarily rate-limited. Please try again in a moment.';
    } else if (lastError && lastError.error?.message) {
      errorMessage = `AI Error: ${lastError.error.message}`;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 503 }
    );

  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 