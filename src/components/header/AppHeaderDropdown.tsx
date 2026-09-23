import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSettings, cilUser } from '@coreui/icons'

const AppHeaderDropdown = () => {
  return (
    <CDropdown variant="nav-item" placement="bottom-end">
      <CDropdownToggle className="py-0 pe-0" caret={false}>
        <CAvatar color="secondary" size="md">
          나
        </CAvatar>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0">
        <CDropdownItem href="#">
          <CIcon icon={cilUser} className="me-2" />
          프로필
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem href="#">
          <CIcon icon={cilSettings} className="me-2" />
          설정
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
