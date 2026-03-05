import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardCheck,
  Truck,
  Command,
  Nfc,
  ClipboardList,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Staff',
    email: 'staff@example.com',
    avatar: '',
  },
  teams: [
    {
      name: 'PX Mage',
      logo: Command,
      plan: 'Staff Portal',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/staff',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Purchase Orders',
      items: [
        {
          title: 'All POs',
          url: '/staff/purchase-orders',
          icon: ShoppingCart,
        },
        {
          title: 'Pending Approval',
          url: '/staff/purchase-orders/pending',
          icon: ClipboardCheck,
        },
        {
          title: 'Ready to Receive',
          url: '/staff/purchase-orders/approved',
          icon: Truck,
        },
      ],
    },
    {
      title: 'NFC Binding',
      items: [
        {
          title: 'Bind NFC',
          url: '/staff/nfc',
          icon: Nfc,
        },
      ],
    },
    {
      title: 'Fulfilment',
      items: [
        {
          title: 'Orders',
          url: '/staff/orders',
          icon: ClipboardList,
        },
      ],
    },
  ],
}
