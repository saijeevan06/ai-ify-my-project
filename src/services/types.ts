import type { AnalyticsEvent, Blueprint, LeaderboardResult, PublicUser, RegisterResult } from '@shared/types';
import type { RegistrationInput } from '@shared/validation';
import type { Stats } from '@shared/domain';

export class ApiError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;
  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export interface Dashboard {
  user: PublicUser;
  leaderboard: LeaderboardResult;
}

export interface ReferrerInfo {
  valid: boolean;
  code?: string;
  firstName?: string;
  college?: string;
  project?: string | null;
}

export interface Api {
  health(): Promise<{ ok: boolean; ai: boolean; demo: boolean; offline?: boolean }>;
  aiify(project: string, opts?: { demo?: boolean }): Promise<Blueprint>;
  blueprint(id: string): Promise<Blueprint>;
  register(input: RegistrationInput): Promise<RegisterResult>;
  me(code: string, token: string): Promise<Dashboard>;
  referrer(code: string): Promise<ReferrerInfo>;
  leaderboard(collegeKey?: string): Promise<LeaderboardResult>;
  colleges(): Promise<string[]>;
  events(events: AnalyticsEvent[]): Promise<void>;
  demoReferral(code: string, token: string): Promise<Dashboard>;
  adminStats(key: string, includeDemo: boolean): Promise<Stats>;
}
