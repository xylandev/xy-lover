import { supabase } from './supabaseClient';
import type { PaperCardData, EmojiReaction } from '../types';
import type { Database } from './database.types';

type CardRow = Database['public']['Tables']['cards']['Row'];
type CardInsert = Database['public']['Tables']['cards']['Insert'];
type CardUpdate = Database['public']['Tables']['cards']['Update'];

/**
 * 将前端的 PaperCardData 转换为数据库格式
 */
function toDbFormat(card: PaperCardData): CardInsert {
  return {
    id: card.id,
    text: card.text,
    author: card.author,
    x: card.x,
    y: card.y,
    rotation: card.rotation,
    timestamp: card.timestamp,
    date_key: card.dateKey,
    width: card.width ?? null,
    height: card.height ?? null,
    reply_to: card.replyTo ?? null,
    emoji_reactions: card.emojiReactions ? JSON.parse(JSON.stringify(card.emojiReactions)) : null,
  };
}

/**
 * 将数据库格式转换为前端的 PaperCardData
 */
function fromDbFormat(row: CardRow): PaperCardData {
  return {
    id: row.id,
    text: row.text,
    author: row.author,
    x: row.x,
    y: row.y,
    rotation: row.rotation,
    timestamp: row.timestamp,
    dateKey: row.date_key,
    isTyping: false, // 从数据库加载的卡片永远不是正在输入状态
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    replyTo: row.reply_to ?? undefined,
    emojiReactions: row.emoji_reactions ? (row.emoji_reactions as EmojiReaction[]) : undefined,
  };
}

/**
 * 获取所有便签
 */
export async function getAllCards(): Promise<PaperCardData[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching cards:', error);
    throw error;
  }

  return data.map(fromDbFormat);
}

/**
 * 创建新便签
 */
export async function createCard(card: PaperCardData): Promise<PaperCardData> {
  const { data, error } = await supabase
    .from('cards')
    .insert(toDbFormat(card))
    .select()
    .single();

  if (error) {
    console.error('Error creating card:', error);
    throw error;
  }

  return fromDbFormat(data);
}

/**
 * 更新便签
 */
export async function updateCard(id: string, updates: Partial<PaperCardData>): Promise<PaperCardData> {
  const dbUpdates: CardUpdate = {};

  if (updates.text !== undefined) dbUpdates.text = updates.text;
  if (updates.x !== undefined) dbUpdates.x = updates.x;
  if (updates.y !== undefined) dbUpdates.y = updates.y;
  if (updates.rotation !== undefined) dbUpdates.rotation = updates.rotation;
  if (updates.width !== undefined) dbUpdates.width = updates.width;
  if (updates.height !== undefined) dbUpdates.height = updates.height;
  if (updates.emojiReactions !== undefined) {
    dbUpdates.emoji_reactions = updates.emojiReactions ? JSON.parse(JSON.stringify(updates.emojiReactions)) : null;
  }

  const { data, error } = await supabase
    .from('cards')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating card:', error);
    throw error;
  }

  return fromDbFormat(data);
}

/**
 * 删除便签
 */
export async function deleteCard(id: string): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting card:', error);
    throw error;
  }
}

/**
 * 订阅实时更新
 */
export function subscribeToCards(
  onInsert: (card: PaperCardData) => void,
  onUpdate: (card: PaperCardData) => void,
  onDelete: (id: string) => void
) {
  const channel = supabase
    .channel('cards_changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'cards' },
      (payload) => {
        onInsert(fromDbFormat(payload.new as CardRow));
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'cards' },
      (payload) => {
        onUpdate(fromDbFormat(payload.new as CardRow));
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'cards' },
      (payload) => {
        onDelete((payload.old as CardRow).id);
      }
    )
    .subscribe();

  // 返回取消订阅函数
  return () => {
    supabase.removeChannel(channel);
  };
}
