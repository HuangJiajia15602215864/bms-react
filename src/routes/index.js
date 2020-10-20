import React from 'react'
import { Redirect } from 'react-router-dom'

import RouteComponents from './components'

function getToken() {
  return sessionStorage.getItem('token')
}

const routes = [
  {
    path: '/login',
    component: RouteComponents.Login
  },
  {
    path: '/forget',
    component: RouteComponents.Forget
  },
  {
    path: '/404',
    component: RouteComponents.NotFound
  },
  {
    render: (props) => {
      const token = getToken()
      if (!token) {
        return <Redirect to="/login" />
      }

      return <RouteComponents.Layout {...props} />
    },
    routes: [
      {
        path: '/',
        exact: true,
        render: () => <Redirect to="/home" />
      },
      {
        path: '/home',
        component: RouteComponents.Home
      },
      {
        path: '/user',
        component: RouteComponents.User
      }
     ]
  },
  {
    path: '*',
    component: RouteComponents.NotFound
  }
]

export default routes