import React, { useState } from 'react';
import { ArrowLeft, Shield, Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface LoginProps {
  onUserLogin?: (email: string, password: string) => boolean;
  onAdminLogin: (email: string, password: string) => boolean;
  onNavigate: (page: any) => void;
}

export function Login({ onUserLogin, onAdminLogin, onNavigate }: LoginProps) {
  const [activeTab, setActiveTab] = useState('user');
  
  // User login state
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [userError, setUserError] = useState('');
  const [userLoading, setUserLoading] = useState(false);

  // Admin login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onUserLogin) {
        const success = onUserLogin(userEmail, userPassword);
        if (!success) {
          setUserError('Email hoặc mật khẩu không chính xác');
        }
      } else {
        // Default user login logic - for now just show success
        setUserError('Tính năng đăng nhập người dùng đang được phát triển');
      }
    } catch (err) {
      setUserError('Có lỗi xảy ra khi đăng nhập');
    } finally {
      setUserLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const success = onAdminLogin(adminEmail, adminPassword);
      if (!success) {
        setAdminError('Email hoặc mật khẩu admin không chính xác');
      }
    } catch (err) {
      setAdminError('Có lỗi xảy ra khi đăng nhập admin');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('home')}
          className="text-white hover:text-yellow-600 mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <h1 className="text-2xl text-white">Đăng nhập</h1>
      </div>

      <div className="max-w-md mx-auto">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-xl">Chào mừng đến với AGUST</CardTitle>
            <p className="text-gray-400 text-sm">Đăng nhập để tiếp tục</p>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800 mb-6">
                <TabsTrigger 
                  value="user" 
                  className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
                >
                  <User className="w-4 h-4 mr-2" />
                  Khách hàng
                </TabsTrigger>
                <TabsTrigger 
                  value="admin" 
                  className="data-[state=active]:bg-gray-700 data-[state=active]:text-yellow-600 text-gray-400"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Quản trị
                </TabsTrigger>
              </TabsList>

              {/* User Login Tab */}
              <TabsContent value="user" className="space-y-4">
                <div className="text-center mb-4">
                  <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-medium">Đăng nhập khách hàng</h3>
                  <p className="text-gray-400 text-sm">Truy cập tài khoản của bạn</p>
                </div>

                <form onSubmit={handleUserSubmit} className="space-y-4">
                  {userError && (
                    <Alert className="bg-red-600 bg-opacity-20 border-red-600">
                      <AlertDescription className="text-red-300">
                        {userError}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="user-email" className="text-white">Email</Label>
                    <div className="relative">
                      <Input
                        id="user-email"
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="Nhập email của bạn"
                        className="bg-gray-800 border-gray-600 text-white pl-10"
                        required
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-password" className="text-white">Mật khẩu</Label>
                    <div className="relative">
                      <Input
                        id="user-password"
                        type={showUserPassword ? "text" : "password"}
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        placeholder="Nhập mật khẩu"
                        className="bg-gray-800 border-gray-600 text-white pl-10 pr-10"
                        required
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowUserPassword(!showUserPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={userLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2"
                  >
                    {userLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang đăng nhập...</span>
                      </div>
                    ) : (
                      'Đăng nhập'
                    )}
                  </Button>
                </form>

                <div className="text-center space-y-2">
                  <Button variant="link" className="text-blue-400 hover:text-blue-300 text-sm">
                    Quên mật khẩu?
                  </Button>
                  <div className="text-gray-400 text-sm">
                    Chưa có tài khoản?{' '}
                    <Button variant="link" className="text-blue-400 hover:text-blue-300 text-sm p-0">
                      Đăng ký ngay
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Admin Login Tab */}
              <TabsContent value="admin" className="space-y-4">
                <div className="text-center mb-4">
                  <div className="mx-auto w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mb-3">
                    <Shield className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-white font-medium">Quản trị viên AGUST</h3>
                  <p className="text-gray-400 text-sm">Đăng nhập để quản lý hệ thống</p>
                </div>

                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  {adminError && (
                    <Alert className="bg-red-600 bg-opacity-20 border-red-600">
                      <AlertDescription className="text-red-300">
                        {adminError}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-white">Email quản trị</Label>
                    <div className="relative">
                      <Input
                        id="admin-email"
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="Nhập email quản trị"
                        className="bg-gray-800 border-gray-600 text-white pl-10"
                        required
                      />
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="text-white">Mật khẩu</Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showAdminPassword ? "text" : "password"}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Nhập mật khẩu admin"
                        className="bg-gray-800 border-gray-600 text-white pl-10 pr-10"
                        required
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={adminLoading}
                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-medium py-2"
                  >
                    {adminLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang đăng nhập...</span>
                      </div>
                    ) : (
                      'Đăng nhập Admin'
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <Alert className="bg-yellow-600 bg-opacity-10 border-yellow-600 text-left">
                    <Shield className="h-4 w-4" />
                    <AlertDescription className="text-yellow-300 text-sm">
                      Chỉ dành cho quản trị viên được ủy quyền. Mọi hoạt động đăng nhập đều được ghi lại.
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}