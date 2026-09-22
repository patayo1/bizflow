import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { noteText } = await req.json();

    if (!noteText || typeof noteText !== 'string') {
      return NextResponse.json({ error: 'Please enter a note to parse' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'pending') {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing in Vercel settings.' }, { status: 500 });
    }

    const systemPrompt = `
You are the financial AI parsing engine for "BizFlow", an assistant for small Nigerian businesses and solar contractors.
Analyze the user's plain-text note and extract all business transactions into clean JSON format.

Rules:
1. All monetary values must be extracted as whole numbers representing Nigerian Naira (e.g. "200k" = 200000, "₦1.2m" = 1200000).
2. Transaction types must be one of:
   - "income" (money received from a client/customer)
   - "expense" (money spent on tools, diesel, transport, wages, etc.)
   - "stock_purchase" (buying equipment, panels, batteries, inverters)
   - "stock_usage" (using equipment on an installation project)
3. Return ONLY a valid JSON array of objects. No markdown backticks, no conversational text.

Output structure for each item:
{
  "type": "income" | "expense" | "stock_purchase" | "stock_usage",
  "amount": number or null,
  "party": "Customer or Supplier or Worker name" or null,
  "project": "Project name or location" or null,
  "item_name": "Product name if stock" or null,
  "quantity": number or null,
  "description": "Short summary of this specific action",
  "confidence": number between 0.0 and 1.0
}
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Note to parse:\n"${noteText}"` }] }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      const detailMsg = errJson?.error?.message || (await response.text());
      return NextResponse.json({ error: `Google AI Error: ${detailMsg}` }, { status: 500 });
    }

    const data = await response.json();
    const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsedTransactions = JSON.parse(rawOutput || '[]');

    return NextResponse.json({ success: true, transactions: parsedTransactions });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
