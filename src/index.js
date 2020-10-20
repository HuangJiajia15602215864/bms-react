import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom' // 路由
import { renderRoutes } from "react-router-config" // 配置静态路由的一个工具库
import { Provider } from 'react-redux'

import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import http from '@/utils/http' // 封装的http请求
import routes from '@/routes'
import '@/style/index.scss'

import configureStore from '@/store'
import rootSaga from '@/store/sagas'

// 将 Saga 与 Redux Store 建立连接
const store = configureStore()
rootSaga.map(saga => store.runSaga(saga))

// 将http挂在的全局下，页面中就可以直接去引用，使用：$http['get'|'post'|...]
React.$http = http

ReactDOM.render(
  <Provider store={store}>
    <ConfigProvider locale={zhCN}>
      <HashRouter>
        {renderRoutes(routes)}
      </HashRouter>
    </ConfigProvider>
  </Provider>,
  document.getElementById('root')
);
