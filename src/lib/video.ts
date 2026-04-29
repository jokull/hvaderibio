export const get_youtube_id = (url: string | undefined) => url?.match(/(?:v=|\/vi\/)([^&?/]+)/)?.[1];

export const is_mobile_user_agent = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
