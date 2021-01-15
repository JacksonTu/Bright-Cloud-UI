module.exports = {
  title: 'Bright-Cloud',
  // 获取令牌时，请求头信息(Basic Base64.encode(client_id:client_secret))
  authorizationValue: 'Basic YnJpZ2h0OjEyMzQ1Ng==',
  // 社交登录后台地址
  socialLoginUrl: 'http://localhost:8002/auth/social/login',
  // 请替换为您的实际地址
  pages: {
    // 消息推送 websocket
    wsUrl: 'http://localhost:8002/ws',
    // Bright-Admin 控制台地址
    springBootAdminUrl: 'http://localhost:8006/login',
    // 文档中心
    docUrl: 'http://localhost:8002/doc.html',
    // nacos 控制台地址
    nacosUrl: 'http://localhost:8848/nacos',
    // kibana 控制台地址
    kibanaUrl: 'http://localhost:9400',
    // skywalking地址
    skywalkingUrl: 'http://localhost:9080/',
    // Granfana控制台
    grafanaUrl: 'http://localhost:9070/'
  }
}
