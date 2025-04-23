export const API_URLS = {
	OPENROUTER: 'https://openrouter.ai/api/v1/chat/completions'
};

export const MODELS = [
	{ value: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Meta - Llama 3.3 70B Instruct' },
	{ value: 'google/gemini-2.5-pro-exp-03-25:free', label: 'Google - Gemini 2.5 Pro Experimental' },
	{ value: 'mistral/small-3.1-24b-32k-instruct:free', label: 'Mistral - Small 3.1 (24B)' },
	{ value: 'deepseek-ai/deepseek-v3-base-8b:free', label: 'DeepSeek - V3 Base (8B)' }
];

export const DEFAULT_SETTINGS = {
	MODEL: 'meta-llama/llama-3.3-70b-instruct:free'
};