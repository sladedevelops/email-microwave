import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

interface EmailGenerationRequest {
  recipientName: string;
  recipientOrganization: string;
  desiredOutcome: string;
  tone: 'warm' | 'formal' | 'casual';
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailGenerationRequest = await request.json();
    const { recipientName, recipientOrganization, desiredOutcome, tone } = body;

    // Validate input
    if (!recipientName || !recipientOrganization || !desiredOutcome) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user is authenticated
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .single();

    if (!profile?.onboarding_completed) {
      return NextResponse.json(
        { success: false, error: 'Please complete onboarding first' },
        { status: 403 }
      );
    }

    // Generate email using OpenAI
    const prompt = `Generate a professional email with the following requirements:

Recipient: ${recipientName} at ${recipientOrganization}
Desired Outcome: ${desiredOutcome}
Tone: ${tone}

Please provide:
1. A compelling subject line
2. A well-structured email body that achieves the desired outcome
3. Use the specified tone throughout

Format the response as JSON with "subject" and "content" fields.`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional email writing assistant. Generate concise, effective emails that achieve the user\'s goals.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', await openaiResponse.text());
      return NextResponse.json(
        { success: false, error: 'Failed to generate email' },
        { status: 500 }
      );
    }

    const openaiData = await openaiResponse.json();
    const generatedText = openaiData.choices[0]?.message?.content;

    if (!generatedText) {
      return NextResponse.json(
        { success: false, error: 'No response from AI service' },
        { status: 500 }
      );
    }

    // Parse the JSON response from OpenAI
    let emailData;
    try {
      emailData = JSON.parse(generatedText);
    } catch (error) {
      // If JSON parsing fails, create a simple structure
      emailData = {
        subject: 'Professional Communication',
        content: generatedText
      };
    }

    // Save the generated email to the database
    const { error: saveError } = await supabase
      .from('emails')
      .insert({
        subject: emailData.subject,
        content: emailData.content,
        from_email: user.email!,
        to_email: `${recipientName}@${recipientOrganization.toLowerCase().replace(/\s+/g, '')}.com`,
        status: 'PENDING'
      });

    if (saveError) {
      console.error('Error saving email:', saveError);
      // Don't fail the request if saving fails
    }

    return NextResponse.json({
      success: true,
      data: {
        subject: emailData.subject,
        content: emailData.content
      }
    });

  } catch (error) {
    console.error('Email generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 