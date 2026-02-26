import { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import Repair from '../models/Repair';

const CONTACT_LINE =
  '0921275611/0910531611 or telegram @abel_ab19,tik tok @babi_abel_19';
const ADDRESS_LINE = 'bambu wha,dessie ,ethiopia';

const SYSTEM_INSTRUCTION =
  "Your name is AB. You are the AI assistant for 'Abel Accessories Sales'. We SELL phones and accessories and we REPAIR phones. " +
  "Answer questions using the catalog provided by the app. If a product is not in the catalog, say it's not listed and offer to check availability or ask the user to contact the shop. " +
  "Be polite and concise. Reply in the same language as the user. Support Amharic (አማርኛ), Afaan Oromo, Tigrinya, Somali, and European languages such as English, French, Spanish, Italian, and German. " +
  "If you cannot confidently detect the language, default to English. " +
  `If asked for contact info, phone number, telegram, tiktok, or how to reach Abel, include this line EXACTLY: '${CONTACT_LINE}'. ` +
  `If asked for address, location, or where the shop is, include this line EXACTLY: '${ADDRESS_LINE}'. ` +
  "If asked about Abel or the shop, include a short sentence about Abel and then include both the contact line and the address line (each on its own line, exact text).";

type ChatMessage = { role: 'user' | 'model'; text: string };

const normalizeMessages = (messages: any[]): { role: 'user' | 'model'; parts: { text: string }[] }[] => {
  return messages
    .filter(m => m && typeof m.text === 'string' && (m.role === 'user' || m.role === 'model'))
    .map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));
};

export const chat = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return next(new AppError('Gemini API key not configured', 500));
  }

  const { message, messages, catalog } = req.body as {
    message?: string;
    messages?: ChatMessage[];
    catalog?: string;
  };
  const contents = Array.isArray(messages) && messages.length
    ? normalizeMessages(messages)
    : message
      ? [{ role: 'user', parts: [{ text: message }] }]
      : [];

  if (!contents.length) {
    return next(new AppError('Message is required', 400));
  }

  const latestText = message || (contents.length ? contents[contents.length - 1].parts?.[0]?.text : '');
  const normalized = (latestText || '').toLowerCase();
  const repairKeywords = [
    'repair',
    'track',
    'tracking',
    'status',
    'fix',
    'service',
    'ሪፓር',
    'ጥገና',
    'መከታተያ',
    'ሁኔታ',
    'ኮድ',
    'sirreess',
    'tajaajil'
  ];
  const isRepairIntent = repairKeywords.some(keyword => normalized.includes(keyword));
  const codeMatch = (latestText || '').match(/r-\d{4,6}/i);

  if (isRepairIntent) {
    if (!codeMatch) {
      return res.status(200).json({
        success: true,
        data: 'Please provide your repair tracking code (e.g., R-8821) so I can check the exact status.'
      });
    }
  }

  if (codeMatch) {
    const code = codeMatch[0].toUpperCase();
    const repair = await Repair.findOne({ trackingCode: code });
    if (!repair) {
      return res.status(200).json({
        success: true,
        data: `I couldn't find a repair with code ${code}. Please double-check the code or contact the shop.`
      });
    }
    return res.status(200).json({
      success: true,
      data: `Repair ${repair.trackingCode} status: ${repair.repairStatus.replace('_', ' ')}. Device: ${repair.deviceModel}.`
    });
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const catalogText = typeof catalog === 'string' ? catalog.trim().slice(0, 6000) : '';
  const systemInstruction = catalogText
    ? `${SYSTEM_INSTRUCTION}\n\nCurrent store catalog (from the app):\n${catalogText}`
    : SYSTEM_INSTRUCTION;

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
      temperature: 0.4
    }
  });

  res.status(200).json({
    success: true,
    data: response.text || "I didn't catch that. Could you say it again?"
  });
});
