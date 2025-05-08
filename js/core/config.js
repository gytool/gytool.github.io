export const API_URLS = {
	OPENROUTER: 'https://openrouter.ai/api/v1/chat/completions'
};

export const MODELS = [
	{ value: 'meta-llama/llama-4-maverick:free', label: 'Meta - Llama 4 Maverick' },
	{ value: 'google/gemini-2.5-pro-exp-03-25:free', label: 'Google - Gemini 2.5 Pro Experimental' },
	{ value: 'qwen/qwen3-235b-a22b:free', label: 'Qwen - Qwen3 235B A22B' },
	{ value: 'deepseek/deepseek-r1:free', label: 'DeepSeek - R1' }
];

export const DEFAULT_SETTINGS = {
	MODEL: 'meta-llama/llama-4-maverick:free'
};