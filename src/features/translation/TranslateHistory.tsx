import React, { useCallback, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Alert, Button, Card, Empty, List, Space, Spin, Tag, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { translationService } from '../../services/translationService';
import type { TranslateHistoryItem, TranslateHistoryResponse } from '../../types/translation';

const { Text, Paragraph } = Typography;

const PAGE_LIMIT = 20;
// Khi khoảng cách từ đáy scroll nhỏ hơn ngưỡng này (px) thì gọi load thêm
const SCROLL_THRESHOLD = 80;
// Chiều cao vùng scroll của danh sách
const LIST_HEIGHT = 480;

interface TranslateHistoryProps {
  onSelectHistory?: (item: TranslateHistoryItem) => void;
  selectedHistoryId?: string | null;
}

const normalizeHistoryResponse = (payload: unknown): TranslateHistoryResponse => {
  if (!payload || typeof payload !== 'object') {
    return { items: [], total: 0, page: 1, limit: PAGE_LIMIT, totalPages: 0 };
  }

  const direct = payload as Partial<TranslateHistoryResponse>;
  if (Array.isArray(direct.items)) {
    return {
      items: direct.items,
      total: direct.total ?? direct.items.length,
      page: direct.page ?? 1,
      limit: direct.limit ?? PAGE_LIMIT,
      totalPages: direct.totalPages ?? 1,
    };
  }

  const wrapped = (payload as { data?: Partial<TranslateHistoryResponse> }).data;
  if (wrapped && Array.isArray(wrapped.items)) {
    return {
      items: wrapped.items,
      total: wrapped.total ?? wrapped.items.length,
      page: wrapped.page ?? 1,
      limit: wrapped.limit ?? PAGE_LIMIT,
      totalPages: wrapped.totalPages ?? 1,
    };
  }

  return { items: [], total: 0, page: 1, limit: PAGE_LIMIT, totalPages: 0 };
};

const TranslateHistory: React.FC<TranslateHistoryProps> = ({
  onSelectHistory,
  selectedHistoryId,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['translation-history-infinite', PAGE_LIMIT],
    queryFn: async ({ pageParam }) => {
      const raw = await translationService.getHistory(pageParam, PAGE_LIMIT);
      return normalizeHistoryResponse(raw);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage <= lastPage.totalPages ? nextPage : undefined;
    },
    staleTime: 30 * 1000,
  });

  const history = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  // Xử lý sự kiện cuộn chuột trong danh sách: gần đến đáy thì tải thêm
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const distanceToBottom =
        target.scrollHeight - target.scrollTop - target.clientHeight;

      if (
        distanceToBottom < SCROLL_THRESHOLD &&
        hasNextPage &&
        !isFetchingNextPage &&
        !isPending
      ) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, isPending],
  );

  const handleReload = () => {
    // refetch sẽ load lại từ trang 1 (react-query infinite query tự refetch tất cả các trang đã tải)
    refetch();
  };

  return (
    <Card
      title="Lịch sử dịch"
      extra={
        <Space>
          {total > 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {history.length}/{total} bản ghi
            </Text>
          )}
          <Button icon={<ReloadOutlined />} onClick={handleReload} loading={isRefetching}>
            Tải lại
          </Button>
        </Space>
      }
      loading={isPending}
    >
      {isError ? (
        <Alert
          type="error"
          showIcon
          message="Không thể tải lịch sử dịch"
          description={(error as Error).message}
        />
      ) : history.length === 0 ? (
        <Empty description="Chưa có lịch sử dịch" />
      ) : (
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{
            maxHeight: LIST_HEIGHT,
            overflowY: 'auto',
            paddingRight: 4,
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={history}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                onClick={() => onSelectHistory?.(item)}
                style={{
                  cursor: 'pointer',
                  borderRadius: 10,
                  padding: '10px 12px',
                  marginBottom: 8,
                  background: selectedHistoryId === item.id ? '#e6f4ff' : '#fafafa',
                  border:
                    selectedHistoryId === item.id ? '1px solid #91caff' : '1px solid #f0f0f0',
                }}
              >
                <Space direction="vertical" size={6} style={{ width: '100%' }}>
                  <Space wrap size={4}>
                    <Tag color="blue" style={{ marginInlineEnd: 0 }}>
                      {item.sourceLanguage}
                    </Tag>
                    <Text>→</Text>
                    <Tag color="green" style={{ marginInlineEnd: 0 }}>
                      {item.targetLanguage}
                    </Tag>
                    {item.cached && <Tag color="gold">cache</Tag>}
                  </Space>

                  <Paragraph ellipsis={{ rows: 1 }} style={{ marginBottom: 0, fontWeight: 500 }}>
                    {item.sourceText}
                  </Paragraph>
                  <Paragraph ellipsis={{ rows: 1 }} style={{ marginBottom: 0, color: '#595959' }}>
                    {item.translatedText}
                  </Paragraph>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </Text>
                </Space>
              </List.Item>
            )}
          />

          {isFetchingNextPage && (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <Spin size="small" />
            </div>
          )}

          {!hasNextPage && history.length > 0 && (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Đã hiển thị toàn bộ lịch sử
              </Text>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default TranslateHistory;