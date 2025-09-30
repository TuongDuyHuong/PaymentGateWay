import React from 'react';
import { ExternalLink, Shield, CreditCard, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

export function PayPalInfo() {
  const handleVisitPayPal = () => {
    window.open('https://paypal.me/NguyenMy2004', '_blank');
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Thông tin tài khoản PayPal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
              <div>
                <div className="text-gray-400 text-sm">Chủ tài khoản</div>
                <div className="text-white flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Nguyen My
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-600 bg-opacity-20 border border-blue-600 rounded">
              <div>
                <div className="text-blue-400 text-sm">PayPal.me Link</div>
                <div className="text-white font-mono">paypal.me/NguyenMy2004</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVisitPayPal}
                className="text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Alert className="bg-green-600 bg-opacity-20 border-green-600">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-green-300">
              <div>
                <div className="font-medium">Tài khoản PayPal đã xác minh</div>
                <div className="text-sm mt-1">
                  Tài khoản này đã được PayPal xác minh và bảo vệ bởi chính sách bảo vệ người mua PayPal.
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <Button
              onClick={handleVisitPayPal}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Truy cập PayPal.me/NguyenMy2004
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}