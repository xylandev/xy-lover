-- 在 Supabase SQL Editor 中运行此脚本来创建数据库表

-- 创建 cards 表
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  author TEXT NOT NULL CHECK (author IN ('ziji', 'xu')),
  x FLOAT NOT NULL,
  y FLOAT NOT NULL,
  rotation FLOAT NOT NULL,
  timestamp BIGINT NOT NULL,
  date_key TEXT NOT NULL,
  width FLOAT,
  height FLOAT,
  reply_to UUID REFERENCES public.cards(id) ON DELETE SET NULL,
  emoji_reactions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_cards_date_key ON public.cards(date_key);
CREATE INDEX IF NOT EXISTS idx_cards_author ON public.cards(author);
CREATE INDEX IF NOT EXISTS idx_cards_reply_to ON public.cards(reply_to);
CREATE INDEX IF NOT EXISTS idx_cards_timestamp ON public.cards(timestamp);

-- 启用行级安全 (RLS)
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人读取
CREATE POLICY "Enable read access for all users" ON public.cards
  FOR SELECT USING (true);

-- 创建策略：允许所有人插入
CREATE POLICY "Enable insert access for all users" ON public.cards
  FOR INSERT WITH CHECK (true);

-- 创建策略：允许所有人更新
CREATE POLICY "Enable update access for all users" ON public.cards
  FOR UPDATE USING (true);

-- 创建策略：允许所有人删除
CREATE POLICY "Enable delete access for all users" ON public.cards
  FOR DELETE USING (true);

-- 注意：由于这是一个私人应用，我们允许所有操作
-- 如果你想添加更严格的权限控制，可以修改这些策略
