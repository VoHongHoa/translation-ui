import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  Input,
  Button,
  Space,
  Spin,
  Empty,
  App,
  Typography,
} from 'antd';
import { SwapOutlined, CopyOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { translationService } from '../../services/translationService';
import type { TranslateHistoryItem, TranslateRequest, TranslateResponse } from '../../types/translation';
import TranslateHistory from './TranslateHistory';

const { TextArea } = Input;
const { Text, Title } = Typography;

// Danh sách ngôn ngữ phổ biến
const LANGUAGES = [
  { label: '🇬🇧 Tiếng Anh', value: 'en' },
  { label: '🇻🇳 Tiếng Việt', value: 'vi' },
  { label: '🇯🇵 Tiếng Nhật', value: 'ja' },
  { label: '🇨🇳 Tiếng Trung', value: 'zh' },
  { label: '🇰🇷 Tiếng Hàn', value: 'ko' },
  { label: '🇫🇷 Tiếng Pháp', value: 'fr' },
  { label: '🇩🇪 Tiếng Đức', value: 'de' },
  { label: '🇪🇸 Tiếng Tây Ban Nha', value: 'es' },
  { label: '🇵🇹 Tiếng Bồ Đào Nha', value: 'pt' },
  { label: '🇷🇺 Tiếng Nga', value: 'ru' },
];

const TranslationPage: React.FC = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [sourceText, setSourceText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('vi');
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [displayedResult, setDisplayedResult] = useState<TranslateResponse | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: TranslateRequest) =>
      translationService.translate(payload),
    onSuccess: (data) => {
      setDisplayedResult(data);
      setSelectedHistoryId(null);
      queryClient.invalidateQueries({ queryKey: ['translation-history'] });
    },
    onError: () => {
      // Lỗi đã được xử lý tập trung trong apiClient interceptor
    },
  });

  const handleTranslate = () => {
    const text = sourceText.trim();

    if (!text) {
      message.warning('Vui lòng nhập văn bản cần dịch.');
      return;
    }

    if (sourceLanguage === targetLanguage) {
      message.warning('Ngôn ngữ nguồn và đích đang giống nhau.');
      return;
    }

    mutate({
      text,
      sourceLanguage,
      targetLanguage,
    });
  };

  // Chỉ cập nhật text, không tự gọi API
  const handleSourceTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceText(e.target.value);
    setSelectedHistoryId(null);
  };

  // Enter để dịch nhanh, Shift+Enter để xuống dòng
  const handlePressEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.shiftKey) {
      return;
    }

    e.preventDefault();
    handleTranslate();
  };

  // Swap language
  const handleSwapLanguage = () => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
    setSelectedHistoryId(null);
    setDisplayedResult(null);
  };

  // Copy kết quả
  const handleCopyResult = () => {
    if (displayedResult?.translation) {
      navigator.clipboard.writeText(displayedResult.translation).then(() => {
        message.success('Sao chép thành công!');
      });
    }
  };

  // Copy source text
  const handleCopySource = () => {
    if (sourceText) {
      navigator.clipboard.writeText(sourceText).then(() => {
        message.success('Sao chép thành công!');
      });
    }
  };

  const handleSelectHistory = (historyItem: TranslateHistoryItem) => {
    setSelectedHistoryId(historyItem.id);
    setSourceText(historyItem.sourceText);
    setSourceLanguage(historyItem.sourceLanguage);
    setTargetLanguage(historyItem.targetLanguage);
    setDisplayedResult({
      translation: historyItem.translatedText,
      detectedLanguage: historyItem.detectedLanguage,
      cached: historyItem.cached,
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={7} xl={6}>
          <TranslateHistory
            onSelectHistory={handleSelectHistory}
            selectedHistoryId={selectedHistoryId}
          />
        </Col>

        <Col xs={24} lg={17} xl={18}>
          <Card
            title={
              <Space direction="vertical" size={0}>
                <Title level={4} style={{ margin: 0 }}>
                  Chat Dịch
                </Title>
                <Text type="secondary">Nhấn vào lịch sử bên trái để tải lại hội thoại đã dịch</Text>
              </Space>
            }
            extra={
              <Button
                type="text"
                icon={<SwapOutlined />}
                onClick={handleSwapLanguage}
                title="Đổi ngôn ngữ nguồn/đích"
              >
                Đổi
              </Button>
            }
          >
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Row gutter={12}>
                <Col xs={24} sm={11}>
                  <Select
                    value={sourceLanguage}
                    onChange={(value) => {
                      setSourceLanguage(value);
                      setSelectedHistoryId(null);
                      setDisplayedResult(null);
                    }}
                    options={LANGUAGES}
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col xs={24} sm={2} style={{ display: 'flex', justifyContent: 'center' }}>
                  <Text>→</Text>
                </Col>
                <Col xs={24} sm={11}>
                  <Select
                    value={targetLanguage}
                    onChange={(value) => {
                      setTargetLanguage(value);
                      setSelectedHistoryId(null);
                      setDisplayedResult(null);
                    }}
                    options={LANGUAGES}
                    style={{ width: '100%' }}
                  />
                </Col>
              </Row>

              <div
                style={{
                  minHeight: 320,
                  maxHeight: 480,
                  overflowY: 'auto',
                  borderRadius: 12,
                  border: '1px solid #f0f0f0',
                  background: '#fcfcfd',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {sourceText ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div
                      style={{
                        maxWidth: '85%',
                        background: '#1677ff',
                        color: '#fff',
                        padding: '10px 12px',
                        borderRadius: 12,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {sourceText}
                    </div>
                  </div>
                ) : (
                  <Empty description="Nhập nội dung hoặc chọn lịch sử để bắt đầu" />
                )}

                {isPending ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div
                      style={{
                        maxWidth: '85%',
                        background: '#fff',
                        border: '1px solid #f0f0f0',
                        padding: '10px 12px',
                        borderRadius: 12,
                      }}
                    >
                      <Spin size="small" />
                      <Text style={{ marginLeft: 8 }}>Đang dịch...</Text>
                    </div>
                  </div>
                ) : displayedResult?.translation ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div
                      style={{
                        maxWidth: '85%',
                        background: '#fff',
                        border: '1px solid #f0f0f0',
                        padding: '10px 12px',
                        borderRadius: 12,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {displayedResult.translation}
                    </div>
                  </div>
                ) : null}
              </div>

              <TextArea
                placeholder="Nhập văn bản cần dịch..."
                value={sourceText}
                onChange={handleSourceTextChange}
                onPressEnter={handlePressEnter}
                rows={5}
                maxLength={5000}
                showCount
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <Space>
                  <Button
                    type="primary"
                    onClick={handleTranslate}
                    loading={isPending}
                    disabled={!sourceText.trim()}
                  >
                    Dịch
                  </Button>
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={handleCopySource}
                    disabled={!sourceText}
                  >
                    Sao chép gốc
                  </Button>
                </Space>

                <Space>
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={handleCopyResult}
                    disabled={!displayedResult?.translation}
                  >
                    Sao chép bản dịch
                  </Button>
                  {displayedResult?.cached && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Từ bộ nhớ đệm
                    </Text>
                  )}
                  {displayedResult?.detectedLanguage && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Ngôn ngữ phát hiện: {displayedResult.detectedLanguage}
                    </Text>
                  )}
                </Space>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TranslationPage;
