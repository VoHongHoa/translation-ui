import {
  BookOutlined,
  EnvironmentOutlined,
  FacebookFilled,
  GithubOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  TranslationOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Layout, Row, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

export default function Homepage() {
  const navigate = useNavigate(); // Khởi tạo navigate
  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fb" }}>
      <Content style={{ padding: "60px 80px" }}>
        {/* Hero */}
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} lg={12}>
            <Space direction="vertical" size={24}>
              <Text
                style={{
                  color: "#1677ff",
                  fontWeight: 700,
                  fontSize: 16,
                  letterSpacing: 1,
                }}
              >
                TRADITIONAL TRANSLATION MODE
              </Text>

              <Title
                level={1}
                style={{
                  margin: 0,
                  fontSize: 48,
                  lineHeight: 1.2,
                }}
              >
                Nền tảng thử nghiệm
                <br />
                Dịch thuật truyền thống kết hợp AI
              </Title>

              <Paragraph
                style={{
                  fontSize: 18,
                  color: "#555",
                  lineHeight: 1.9,
                }}
              >
                <strong>Traditional Translation Mode</strong> là nền tảng thử
                nghiệm được xây dựng nhằm nghiên cứu, đánh giá và hoàn thiện các
                phương pháp dịch thuật truyền thống kết hợp với công nghệ trí
                tuệ nhân tạo. Hệ thống hiện đang trong giai đoạn phát triển
                (Beta), vì vậy kết quả dịch chỉ mang tính tham khảo và có thể
                được điều chỉnh, cải tiến trong các phiên bản tiếp theo.
                <br />
                <br />
                Để đảm bảo tài nguyên hệ thống được phân bổ công bằng cho tất cả
                người dùng, mỗi tài khoản được áp dụng các giới hạn mặc định:
                <ul style={{ marginTop: 12 }}>
                  <li>
                    Tối đa <strong>20 lượt dịch mỗi ngày</strong>.
                  </li>
                  <li>
                    Tổng cộng <strong>3.000 ký tự mỗi ngày</strong>.
                  </li>
                  <li>
                    Mỗi lần dịch tối đa <strong>500 ký tự</strong>.
                  </li>
                </ul>
                Trong trường hợp cần sử dụng với hạn mức cao hơn hoặc phục vụ
                mục đích nghiên cứu, vui lòng liên hệ nhóm phát triển để được hỗ
                trợ.
              </Paragraph>

              <Space>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate("/translate")}
                >
                  Bắt đầu dịch
                </Button>

                <Button size="large">Tìm hiểu thêm</Button>
              </Space>
            </Space>
          </Col>

          <Col xs={24} lg={12}>
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900"
              alt="Translation"
              style={{
                width: "100%",
                borderRadius: 24,
                boxShadow: "0 20px 50px rgba(0,0,0,.12)",
              }}
            />
          </Col>
        </Row>

        {/* Features */}
        <div style={{ marginTop: 80 }}>
          <Title level={2} style={{ textAlign: "center" }}>
            Tính năng nổi bật
          </Title>

          <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
            <Col xs={24} md={8}>
              <Card hoverable bordered={false}>
                <Space direction="vertical">
                  <TranslationOutlined
                    style={{ fontSize: 40, color: "#1677ff" }}
                  />

                  <Title level={4}>Dịch đa ngôn ngữ</Title>

                  <Paragraph>
                    Hỗ trợ dịch giữa nhiều ngôn ngữ với mục tiêu cải thiện độ
                    chính xác và giữ nguyên ngữ cảnh.
                  </Paragraph>
                </Space>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card hoverable bordered={false}>
                <Space direction="vertical">
                  <BookOutlined style={{ fontSize: 40, color: "#52c41a" }} />

                  <Title level={4}>So sánh bản dịch</Title>

                  <Paragraph>
                    Cho phép đánh giá và so sánh giữa các phương pháp dịch
                    truyền thống và mô hình AI.
                  </Paragraph>
                </Space>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card hoverable bordered={false}>
                <Space direction="vertical">
                  <SafetyCertificateOutlined
                    style={{ fontSize: 40, color: "#fa8c16" }}
                  />

                  <Title level={4}>An toàn dữ liệu</Title>

                  <Paragraph>
                    Dữ liệu được sử dụng phục vụ mục đích nghiên cứu và thử
                    nghiệm, không chia sẻ với bên thứ ba.
                  </Paragraph>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>

        {/* About */}
        <div style={{ marginTop: 80 }}>
          <Card
            bordered={false}
            style={{
              borderRadius: 20,
            }}
          >
            <Row gutter={[40, 40]} align="middle">
              <Col xs={24} lg={14}>
                <Title level={2}>Về dự án</Title>

                <Paragraph style={{ fontSize: 16 }}>
                  Website được phát triển nhằm phục vụ việc nghiên cứu, thử
                  nghiệm và đánh giá các mô hình dịch thuật. Nội dung hiển thị
                  và kết quả dịch chỉ mang tính tham khảo trong giai đoạn phát
                  triển.
                </Paragraph>

                <Paragraph style={{ fontSize: 16 }}>
                  Chúng tôi luôn hoan nghênh các ý kiến đóng góp nhằm cải thiện
                  chất lượng hệ thống.
                </Paragraph>
              </Col>

              <Col xs={24} lg={10}>
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900"
                  alt="Team"
                  style={{
                    width: "100%",
                    borderRadius: 16,
                  }}
                />
              </Col>
            </Row>
          </Card>
        </div>

        {/* Contact */}
        <div style={{ marginTop: 80 }}>
          <Title level={2} style={{ textAlign: "center" }}>
            Thông tin liên hệ
          </Title>

          <Row justify="center" gutter={[24, 24]} style={{ marginTop: 30 }}>
            <Col xs={24} md={12} lg={8}>
              <Card>
                <Space align="start">
                  <MailOutlined
                    style={{
                      color: "#1677ff",
                      fontSize: 24,
                    }}
                  />

                  <div>
                    <Text strong>Email</Text>
                    <br />
                    <Text copyable>support@translation-demo.com</Text>
                  </div>
                </Space>
              </Card>
            </Col>

            <Col xs={24} md={12} lg={8}>
              <Card>
                <Space align="start">
                  <PhoneOutlined
                    style={{
                      color: "#52c41a",
                      fontSize: 24,
                    }}
                  />

                  <div>
                    <Text strong>Hotline</Text>
                    <br />
                    <Text copyable>0123 456 789</Text>
                  </div>
                </Space>
              </Card>
            </Col>

            <Col xs={24} md={12} lg={8}>
              <Card>
                <Space align="start">
                  <FacebookFilled
                    style={{
                      color: "#1877F2",
                      fontSize: 24,
                    }}
                  />

                  <div>
                    <Text strong>Facebook</Text>
                    <br />
                    <a
                      href="https://www.facebook.com/vohonghoaa1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      facebook.com/vohonghoaa1
                    </a>
                  </div>
                </Space>
              </Card>
            </Col>

            <Col xs={24} md={12} lg={8}>
              <Card>
                <Space align="start">
                  <GlobalOutlined
                    style={{
                      color: "#fa8c16",
                      fontSize: 24,
                    }}
                  />

                  <div>
                    <Text strong>Website</Text>
                    <br />
                    <a
                      href="https://traditional-translate.netlify.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      traditional-translate.netlify.app
                    </a>
                  </div>
                </Space>
              </Card>
            </Col>

            <Col xs={24} md={12} lg={8}>
              <Card>
                <Space align="start">
                  <GithubOutlined
                    style={{
                      color: "#000",
                      fontSize: 24,
                    }}
                  />

                  <div>
                    <Text strong>GitHub</Text>
                    <br />
                    <a
                      href="https://github.com/vohonghoaa1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      github.com/vohonghoaa1
                    </a>
                  </div>
                </Space>
              </Card>
            </Col>

            <Col xs={24} md={12} lg={8}>
              <Card>
                <Space align="start">
                  <EnvironmentOutlined
                    style={{
                      color: "#ff4d4f",
                      fontSize: 24,
                    }}
                  />

                  <div>
                    <Text strong>Địa chỉ</Text>
                    <br />
                    <Text>Việt Nam</Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>

      <Footer
        style={{
          textAlign: "center",
          background: "#001529",
          color: "#fff",
        }}
      >
        Traditional Translation Mode © 2026
        <br />
        Website thử nghiệm phục vụ nghiên cứu và đánh giá hệ thống dịch thuật.
      </Footer>
    </Layout>
  );
}
