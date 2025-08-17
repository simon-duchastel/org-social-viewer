/**
 * Core types for org-social data structures
 */

export interface OrgSocialUser {
  title: string
  nick: string
  description: string
  avatar: string
  links: string[]
  follows: FollowInfo[]
  contacts: string[]
  posts: OrgSocialPost[]
  polls: OrgSocialPost[]
  sourceUrl: string
  followInfo?: FollowInfo
}

export interface FollowInfo {
  nick: string
  url: string
}

export interface OrgSocialPost {
  id?: string
  content: string
  rawContent: string
  timestamp: string
  parsedDate?: Date | null
  properties: Record<string, string>
  mentions: Mention[]
  links: Link[]
  isReply: boolean
  replyTo?: string
  replyUrl?: string
  checkboxes: CheckboxItem[]
  isPoll: boolean
  displayContent: string
}

export interface Mention {
  url: string
  name: string
}

export interface Link {
  url: string
  text: string
}

export interface CheckboxItem {
  checked: boolean
  text: string
}

export interface ParseOptions {
  sourceUrl?: string
  preserveRawContent?: boolean
  enableMentionParsing?: boolean
  enableLinkParsing?: boolean
}

export interface ParseResult {
  user: OrgSocialUser
  parseTime: number
  warnings: string[]
}