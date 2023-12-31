// 该服务为 vercel serve跨域处理
// import createProxyMiddleware from 'http-proxy-middleware'
const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = (req, res) => {
  let target = ''

  // 代理目标地址
  // xxxxx 替换为你跨域请求的服务器 如： http://baidu.com
  if (req.url.startsWith('/pay-management')) {
    // 这里填目标地址
    target = 'http://47.108.163.219:10070'
  }

  console.log('url:', req.url)
  console.log('target:', target)
  // 创建代理对象并转发请求
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      // 通过路径重写，去除请求路径中的 `/api`
      // 例如 /api/user/login 将被转发到 http://target/user/login
      '^/pay-management/': '/pay-management/'
    }
  })(req, res)
}
