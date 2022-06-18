import { fetch, FetchResultTypes } from '@kirishima/fetch';
import { AsyncQueue } from '@sapphire/async-queue';
import { Routes } from 'lavalink-api-types';
import type { RoutePlannerStatusResponse, LoadTrackResponse, LavalinkTrack } from 'lavalink-api-types';
import { LavalinkSourceEnum, LavalinkSearchIdentifierEnum } from 'lavalink-api-types';
import type { LavalinkSource } from 'lavalink-api-types';
import type { RequestInit } from 'undici';

export class REST {
	public headers: { [key: string]: string } = {};
	public queue = new AsyncQueue();

	public routeplanner = {
		freeAddress: async (address: string): Promise<void> => {
			await this.post<string>(Routes.routePlannerFreeAddress(), { body: JSON.stringify({ address }) });
		},
		freeAllAddress: async (): Promise<void> => {
			await this.post<string>(Routes.routePlannerFreeAll());
		},
		status: async (): Promise<RoutePlannerStatusResponse> => {
			return this.get<RoutePlannerStatusResponse>(Routes.routePlannerStatus());
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
			return this.get<LoadTrackResponse>(
				Routes.loadTracks(
					this.isUrl(options)
						? encodeURIComponent(options)
						: encodeURIComponent(`${this.resolveIdentifier(LavalinkSourceEnum.Youtube)}:${options}`)
				)
			);
		}
		const source = options.source ?? LavalinkSourceEnum.Youtube;
		const { query } = options;
		return this.get<LoadTrackResponse>(
			Routes.loadTracks(
				this.isUrl(options.query) ? encodeURIComponent(query) : `${encodeURIComponent(`${this.resolveIdentifier(source)}:${query}`)}`
			)
		);
	}

	public decodeTracks(trackOrTracks: LavalinkTrack['track'][] | LavalinkTrack['track']) {
		if (Array.isArray(trackOrTracks)) {
			return this.post<LavalinkTrack[]>(Routes.decodeTracks(), {
				body: JSON.stringify(trackOrTracks),
				headers: { ...this.headers, 'Content-Type': 'application/json' }
			});
		}
		return this.post<LavalinkTrack[]>(Routes.decodeTracks(), {
			body: JSON.stringify([trackOrTracks]),
			headers: { ...this.headers, 'Content-Type': 'application/json' }
		});
	}

	public async get<T>(route: string, init?: RequestInit | undefined): Promise<T> {
		await this.queue.wait();
		try {
			return fetch(`${this.url}${route}`, { headers: this.headers, ...init }, FetchResultTypes.JSON);
		} finally {
			this.queue.shift();
		}
	}

	public async post<T>(route: string, init?: RequestInit | undefined): Promise<T> {
		await this.queue.wait();
		try {
			return fetch(`${this.url}${route}`, { headers: this.headers, method: 'POST', ...init }, FetchResultTypes.JSON);
		} finally {
			this.queue.shift();
		}
	}
}
