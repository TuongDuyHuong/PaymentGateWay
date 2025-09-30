import React from 'react';
import { ShoppingCart, Search, User, Menu, Shield, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../App';

interface HeaderProps {
  onNavigate: (page: 'home' | 'cart' | 'checkout' | 'payment' | 'confirmation' | 'login' | 'admin-dashboard' | 'email-demo') => void;
  currentPage: string;
  isAdminLoggedIn?: boolean;
  onAdminLogout?: () => void;
}

export function Header({ onNavigate, currentPage, isAdminLoggedIn, onAdminLogout }: HeaderProps) {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
      {/* Top banner */}
      <div className="bg-yellow-600 text-black text-center py-2 text-sm">
        📞 Hotline: 0981 654 346 📧 Email: support@agust.vn VẬN CHUYỂN TOÀN QUỐC
      </div>
      
      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left menu */}
          <div className="flex items-center space-x-6">
            <Button variant="ghost" size="sm" className="text-yellow-600">
              <Menu className="w-4 h-4 mr-2" />
              MENU
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:text-yellow-600">
              COLLECTIONS
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:text-yellow-600">
              EYEWEAR
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:text-yellow-600">
              FEEDBACK
            </Button>
          </div>

          {/* Logo */}
          <div 
            className="text-2xl font-bold text-white cursor-pointer tracking-wider"
            onClick={() => onNavigate('home')}
          >
            AGUST
          </div>

          {/* Right menu */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">Tiếng Việt</span>
            
            {isAdminLoggedIn ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-yellow-600 hover:text-yellow-500"
                  onClick={() => onNavigate('admin-dashboard')}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Quản trị
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-400 hover:text-blue-300"
                  onClick={() => onNavigate('email-demo')}
                >
                  📧 Email
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:text-red-400"
                  onClick={onAdminLogout}
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Đăng xuất
                </Button>
              </>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:text-yellow-600"
                onClick={() => onNavigate('login')}
              >
                <User className="w-4 h-4 mr-2" />
                Đăng nhập
              </Button>
            )}
            
            <Button variant="ghost" size="sm" className="text-white hover:text-yellow-600">
              <Search className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:text-yellow-600 relative"
              onClick={() => onNavigate('cart')}
            >
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-600 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
            <span className="text-white">Hệ thống cửa hàng</span>
          </div>
        </div>
      </div>
    </header>
  );
}