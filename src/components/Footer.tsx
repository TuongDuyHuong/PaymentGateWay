import React from 'react';
import { Facebook, Youtube, Instagram, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const customerCareLinks = [
    'Hướng dẫn thanh toán',
    'Giao hàng',
    'Chính sách bảo hành',
    'Chính sách đổi trả',
    'Chính sách bảo mật',
    'Bảng giá phí điều chỉnh sản phẩm',
    'Feedback'
  ];

  const aboutUsLinks = [
    'Câu chuyện của Agust',
    'Hệ thống cửa hàng',
    'Tuyển dụng',
    'Membership by Agust'
  ];

  const customerLinks = [
    'Blog',
    'Hướng dẫn bảo quản sản phẩm',
    'Hướng dẫn đo Size',
    'Cơ hội hợp tác cùng Agust'
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Youtube, href: '#', label: 'YouTube' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Phone, href: 'tel:0981654116', label: 'Hotline' }
  ];

  return (
    <footer className="bg-black text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Connect with us */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">KẾT NỐI VỚI CHÚNG TÔI</h3>
            <div className="space-y-3">
              <p className="text-gray-300 text-sm leading-relaxed">
                Agust hướng đến việc trở thành thương hiệu trang sức bạc nghệ thuật đại diện cho tinh thần tự do và cá tính của thế hệ trẻ Việt Nam. Không chỉ là nơi bán trang sức, Agust muốn kiến tạo một cộng đồng của những tâm hồn mạnh mẽ, nơi mà từng thiết kế trở thành một phần trong hành trình khẳng định bản thân, dám sống khác biệt và đầy kiêu hãnh.
              </p>
              
              <div className="space-y-2">
                <div className="text-gray-300 text-sm">Hotline Hà Nội:</div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-yellow-600" />
                  <span className="text-white">0981 654 346</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <span className="text-white text-sm">Trần Phú, Hà Nội</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-yellow-600" />
                  <span className="text-white text-sm">Email: support@agust.vn</span>
                </div>
              </div>
            </div>
            
            {/* Certification */}
            <div className="mt-6">
              <div className="text-gray-300 text-xs">
                <div>ĐÃ THÔNG BÁO BỘ CÔNG THƯƠNG</div>
              </div>
            </div>
          </div>

          {/* Customer Care */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">CHĂM SÓC KHÁCH HÀNG</h3>
            <div className="space-y-3">
              {customerCareLinks.map((link, index) => (
                <div key={index}>
                  <Button 
                    variant="link" 
                    className="text-gray-300 hover:text-yellow-600 p-0 h-auto text-sm justify-start"
                  >
                    {link}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* About Us */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">VỀ CHÚNG TÔI</h3>
            <div className="space-y-3">
              {aboutUsLinks.map((link, index) => (
                <div key={index}>
                  <Button 
                    variant="link" 
                    className="text-gray-300 hover:text-yellow-600 p-0 h-auto text-sm justify-start"
                  >
                    {link}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* For Customers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">DÀNH CHO KHÁCH HÀNG</h3>
            <div className="space-y-3">
              {customerLinks.map((link, index) => (
                <div key={index}>
                  <Button 
                    variant="link" 
                    className="text-gray-300 hover:text-yellow-600 p-0 h-auto text-sm justify-start"
                  >
                    {link}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator className="bg-gray-800 mb-6" />

        {/* Social Media & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            {socialLinks.map((social, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-yellow-600 p-2"
                asChild
              >
                <a href={social.href} aria-label={social.label}>
                  <social.icon className="w-5 h-5" />
                </a>
              </Button>
            ))}
          </div>

          <div className="text-gray-400 text-sm">
            © 2025 AGUST • All Rights Reserved.
          </div>

          <div className="flex items-center space-x-6 text-gray-400 text-sm">
            <Button 
              variant="link" 
              className="text-gray-400 hover:text-yellow-600 p-0 h-auto text-sm"
            >
              ABOUT US
            </Button>
            <Button 
              variant="link" 
              className="text-gray-400 hover:text-yellow-600 p-0 h-auto text-sm"
            >
              STORE
            </Button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <div className="text-gray-500 text-xs">
            <p className="mb-2">
              CÔNG TY TNHH AGUST VIETNAM | Mã số thuế: 0123456789 | 
              Địa chỉ: Trần Phú, Hà Nội
            </p>
            <p>
              Giấy chứng nhận đăng ký doanh nghiệp số 0123456789 do Sở KH&ĐT TP.HCM cấp lần đầu ngày 01/01/2020
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}