export interface SlackMessageAction {
    token: string;
    team_id: string;
    api_app_id: string;
    event: {
        type: string,
        user: string,
        item: {
            type: string,
            channel: string,
            ts: string
        },
        reaction: string,
        item_user: string,
        event_ts: string
    };
    type: string;
    authed_users: string[];
    event_id: string;
    event_time: number;
}

export interface SlackUserChangeAction {
    token: string;
    team_id: string;
    api_app_id: string;
    event: {
        type: string,
        user: {
            id: string
            name: string
        },
        item: {
            type: string,
            channel: string,
            ts: string
        },
        reaction: string,
        item_user: string,
        event_ts: string
    };
    type: string;
    authed_users: string[];
    event_id: string;
    event_time: number;
}


export interface SlackUser {
    id: string;
    team_id: string;
    name: string;
    deleted: boolean;
    color: string;
    real_name: string;
    tz: string;
    tz_label: string;
    tz_offset: number;
    profile: SlackUserProfile;
    is_admin: boolean;
    is_owner: boolean;
    is_primary_owner: boolean;
    is_restricted: boolean;
    is_ultra_restricted: boolean;
    is_bot: boolean;
    is_stranger: boolean;
    updated: number;
    is_app_user: boolean;
    has_2fa: boolean;
    locale: string;
}

export interface SlackUserProfile {
    avatar_hash: string;
    status_text: string;
    status_emoji: string;
    real_name: string;
    display_name: string;
    real_name_normalized: string;
    display_name_normalized: string;
    email: string;
    image_24: string;
    image_32: string;
    image_48: string;
    image_72: string;
    image_192: string;
    image_512: string;
    team: string;
}

export interface SlackSlashCommand {
    token: string;
    team_id: string;
    team_domain: string;
    channel_id: string;
    channel_name: string;
    user_id: string;
    user_name: string;
    command: string;
    text: string;
    response_url: string;
}
