import {
	LavalinkSource,
	LavalinkSourceEnum,
	LoadTrackResponse,
	LavalinkSearchIdentifierEnum,
	LavalinkTrack,
	RoutePlannerStatusResponse
} from 'lavalink-api-types';
import { fetch, FetchResultTypes } from '@kirishima/fetch';
import { AsyncQueue } from '@sapphire/async-queue';
import type { RequestInit } from 'undici';

export class REST {
	public headers: { [key: string]: string } = {};
	public queue = new AsyncQueue();

	public routeplanner = {
		freeAddress: async (address: string): Promise<void> => {
			await this.post<string>('routeplanner/free/address', { body: JSON.stringify({ address }) });
		},
		freeAllAddress: async (): Promise<void> => {
			await this.post<string>('routeplanner/free/all');
		},
		status: async (): Promise<RoutePlannerStatusResponse> => {
			return this.get<RoutePlannerStatusResponse>('routeplanner/status');
		}
	};

	public constructor(public url: string, headers: { [key: string]: string } = {}) {
		this.headers = headers;
	}

	public isUrl(url: string) {
		try {
			new URL(url);
			return true;
		} catch (_e) {
			return false;
		}
	}

	public resolveIdentifier(source: LavalinkSource) {
		return source === LavalinkSourceEnum.Youtube
			? LavalinkSearchIdentifierEnum.YT_SEARCH
			: source === LavalinkSourceEnum.Soundcloud
			? LavalinkSearchIdentifierEnum.SC_SEARCH
			: source === LavalinkSearchIdentifierEnum.YTM_SEARCH
			? LavalinkSearchIdentifierEnum.YTM_SEARCH
			: source;
	}

	public setAuthorization(auth: string) {
		this.headers['Authorization'] = auth;
		return this;
	}

	public loadTracks(options: { source?: LavalinkSource; query: string } | string) {
		if (typeof options === 'string') {
			return this.get<LoadTrackResponse>(`loadtracks?identifier=${this.resolveIdentifier(LavalinkSourceEnum.Youtube)}:${options}`);
		}
		const source = options.source ?? LavalinkSourceEnum.Youtube;
		const { query } = options;
		return this.get<LoadTrackResponse>(
			`loadtracks?identifier=${this.isUrl(options.query) ? query : `${this.resolveIdentifier(source)}:${query}`}`
		);
	}

	public decodeTracks(trackOrTracks: LavalinkTrack['track'][] | LavalinkTrack['track']) {
		if (Array.isArray(trackOrTracks)) {
			return this.post<LavalinkTrack[]>('decodetracks', {
				body: JSON.stringify(trackOrTracks),
				headers: { ...this.headers, 'Content-Type': 'application/json' }
			});
		}
		return this.post<LavalinkTrack[]>('decodetracks', {
			body: JSON.stringify([trackOrTracks]),
			headers: { ...this.headers, 'Content-Type': 'application/json' }
		});
	}

	private async get<T>(route: string, init?: RequestInit | undefined): Promise<T> {
		await this.queue.wait();
		try {
			return fetch(`${this.url}/${route}`, { headers: this.headers, ...init }, FetchResultTypes.JSON);
		} finally {
			this.queue.shift();
		}
	}

	private async post<T>(route: string, init?: RequestInit | undefined): Promise<T> {
		await this.queue.wait();
		try {
			return fetch(`${this.url}/${route}`, { headers: this.headers, method: 'POST', ...init }, FetchResultTypes.JSON);
		} finally {
			this.queue.shift();
		}
	}
}
