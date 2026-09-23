import { NavLink } from 'react-router-dom'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import { CNavItem, CNavLink, CNavTitle, CSidebarNav } from '@coreui/react'
import _nav from '../_nav'

const AppSidebarNav = () => {
  return (
    <CSidebarNav as={SimpleBar}>
      {_nav.map((item, index) =>
        item.type === 'title' ? (
          <CNavTitle key={index}>{item.name}</CNavTitle>
        ) : (
          <CNavItem key={index}>
            <CNavLink as={NavLink} to={item.to}>
              {item.icon}
              {item.name}
            </CNavLink>
          </CNavItem>
        ),
      )}
    </CSidebarNav>
  )
}

export default AppSidebarNav
