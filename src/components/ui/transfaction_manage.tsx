import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Filter, Download, Edit, CheckCircle, Clock, XCircle, RefreshCw, AlertCircle, Save, Mail } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Badge } from './badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { useCart, Transaction } from '../../App';
import { EmailService } from '../EmailService';
import { toast } from "sonner@2.0.3";

interface TransactionManageProps {
  onNavigate: (page: any) => void;
}

type StatusType = 'completed' | 'processing' | 'failed' | 'refunded';

const statusConfig = {
  completed: { label: 'Thành công', color: 'bg-green-600', icon: CheckCircle },
  processing: { label: 'Đang xử lý', color: 'bg-blue-600', icon: RefreshCw },
  failed: { label: 'Thất bại', color: 'bg-red-600', icon: XCircle },
  refunded: { label: 'Hoàn tiền', color: 'bg-gray-600', icon: AlertCircle }
};

const paymentMethodLabels: { [key: string]: string } = {
  'bank_transfer': 'Chuyển khoản',
  'vnpay': 'VNPay',
  'zalopay': 'ZaloPay',
  'viettel_money': 'Viettel Money',
  'paypal': 'PayPal',
  'cod': 'COD'
};

export function TransactionManage({ onNavigate }: TransactionManageProps) {
  const { transactions, updateTransactionStatus } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  // State để lưu trạng thái tạm thời cho từng giao dịch
  const [pendingStatusChanges, setPendingStatusChanges] = useState<{[key: string]: StatusType}>({});
  const [emailSendingStatus, setEmailSendingStatus] = useState<{[key: string]: boolean}>({});

  // Create sample transactions if none exist
  const sampleTransactions: Transaction[] = useMemo(() => {
    if (transactions.length > 0) return [];
    
    return [
      {
        id: 'TXN_1734644401234',
        orderNumber: 'HD44401234',
        customerName: 'Nguyễn Văn A',
        customerEmail: 'nguyenvana@gmail.com',
        date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        amount: 2500000,
        paymentMethod: 'Chuyển khoản ngân hàng',
        status: 'completed',
        items: [],
        paymentDetails: { orderNumber: 'HD44401234' }
      },
      {
        id: 'TXN_1734644401235',
        orderNumber: 'HD44401235',
        customerName: 'Trần Thị B',
        customerEmail: 'tranthib@gmail.com',
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        amount: 1200000,
        paymentMethod: 'VNPay',
        status: 'processing',
        items: [],
        paymentDetails: { orderNumber: 'HD44401235' }
      },
      {
        id: 'TXN_1734644401236',
        orderNumber: 'HD44401236',
        customerName: 'Lê Văn C',
        customerEmail: 'levanc@gmail.com',
        date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        amount: 3500000,
        paymentMethod: 'Viettel Money',
        status: 'processing',
        items: [],
        paymentDetails: { orderNumber: 'HD44401236' }
      },
      {
        id: 'TXN_1734644401237',
        orderNumber: 'HD44401237',
        customerName: 'Phạm Thị D',
        customerEmail: 'phamthid@gmail.com',
        date: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        amount: 800000,
        paymentMethod: 'ZaloPay',
        status: 'failed',
        items: [],
        paymentDetails: { orderNumber: 'HD44401237' }
      },
      {
        id: 'TXN_1734644401238',
        orderNumber: 'HD44401238',
        customerName: 'Hoàng Văn E',
        customerEmail: 'hoangvane@gmail.com',
        date: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
        amount: 1500000,
        paymentMethod: 'PayPal',
        status: 'refunded',
        items: [],
        paymentDetails: { orderNumber: 'HD44401238' }
      }
    ];
  }, [transactions]);

  // Combine transactions but avoid duplicates by using unique IDs
  const allTransactions = useMemo(() => {
    const combined = [...sampleTransactions, ...transactions];
    const uniqueTransactions = combined.filter((transaction, index, self) => 
      index === self.findIndex(t => t.id === transaction.id)
    );
    
    // Cập nhật các transaction có status 'pending' thành 'processing'
    return uniqueTransactions.map(transaction => {
      if (transaction.status === 'pending' as any) {
        return { ...transaction, status: 'processing' as StatusType };
      }
      return transaction;
    });
  }, [sampleTransactions, transactions]);

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(transaction => {
      const matchesSearch = searchTerm === '' || 
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      
      const matchesDate = dateFilter === '' || 
        new Date(transaction.date).toISOString().split('T')[0] === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [allTransactions, searchTerm, statusFilter, dateFilter]);

  const statusCounts = useMemo(() => {
    const counts = {
      total: allTransactions.length,
      completed: 0,
      processing: 0,
      failed: 0,
      refunded: 0
    };

    allTransactions.forEach(transaction => {
      counts[transaction.status]++;
    });

    return counts;
  }, [allTransactions]);

  // Thống kê doanh thu
  const revenueStats = useMemo(() => {
    const stats = {
      totalRevenue: 0,        // Tổng doanh thu từ giao dịch thành công
      refundedAmount: 0,      // Tổng số tiền hoàn
      failedAmount: 0,        // Tổng số tiền giao dịch thất bại
      netRevenue: 0           // Doanh thu thực nhận (tổng doanh thu - hoàn tiền)
    };

    allTransactions.forEach(transaction => {
      switch(transaction.status) {
        case 'completed':
          stats.totalRevenue += transaction.amount;
          break;
        case 'refunded':
          stats.refundedAmount += transaction.amount;
          break;
        case 'failed':
          stats.failedAmount += transaction.amount;
          break;
      }
    });

    stats.netRevenue = stats.totalRevenue - stats.refundedAmount;

    return stats;
  }, [allTransactions]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const exportToCSV = () => {
    // Chuẩn bị dữ liệu cho CSV
    const csvData = filteredTransactions.map(transaction => ({
      'Mã giao dịch': transaction.id,
      'Mã đơn hàng': transaction.orderNumber,
      'Khách hàng': transaction.customerName,
      'Email': transaction.customerEmail,
      'Ngày giao dịch': formatDate(transaction.date),
      'Số tiền (VND)': transaction.amount,
      'Phương thức thanh toán': transaction.paymentMethod,
      'Trạng thái': statusConfig[transaction.status]?.label || 'Không xác định',
      'Cập nhật lần cuối': transaction.updatedAt ? formatDate(transaction.updatedAt) : 'Chưa cập nhật'
    }));

    // Thêm thống kê doanh thu vào đầu file
    const summaryData = [
      { 'Thống kê': 'Tổng số giao dịch', 'Giá trị': statusCounts.total.toString() },
      { 'Thống kê': 'Giao dịch thành công', 'Giá trị': statusCounts.completed.toString() },
      { 'Thống kê': 'Đang xử lý', 'Giá trị': statusCounts.processing.toString() },
      { 'Thống kê': 'Thất bại', 'Giá trị': statusCounts.failed.toString() },
      { 'Thống kê': 'Hoàn tiền', 'Giá trị': statusCounts.refunded.toString() },
      { 'Thống kê': 'Tổng doanh thu (VND)', 'Giá trị': revenueStats.totalRevenue.toString() },
      { 'Thống kê': 'Doanh thu thực nhận (VND)', 'Giá trị': revenueStats.netRevenue.toString() },
      { 'Thống kê': 'Tổng hoàn tiền (VND)', 'Giá trị': revenueStats.refundedAmount.toString() },
      { 'Thống kê': 'Tổng giao dịch thất bại (VND)', 'Giá trị': revenueStats.failedAmount.toString() },
      {}, // Dòng trống
      { 'Chi tiết giao dịch': '=== DANH SÁCH GIAO DỊCH ===' }
    ];

    // Chuyển đổi thành CSV
    const convertToCSV = (data: any[]) => {
      if (data.length === 0) return '';
      
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // Escape quotes và wrap trong quotes nếu chứa comma
            return `"${value.toString().replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');
      
      return csvContent;
    };

    // Tạo CSV content với BOM để hỗ trợ tiếng Việt
    const summaryCSV = convertToCSV(summaryData);
    const transactionCSV = convertToCSV(csvData);
    const fullCSV = summaryCSV + '\n' + transactionCSV;
    const BOM = '\uFEFF'; // Byte Order Mark để Excel đọc đúng UTF-8
    const csvContent = BOM + fullCSV;

    // Tạo và download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Tạo tên file với timestamp
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
    const fileName = `AGUST_BaoCaoGiaoDich_${timestamp}.csv`;
    
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Hiển thị thông báo
    console.log(`✅ Đã xuất báo cáo: ${fileName}`);
    console.log(`📊 Bao gồm ${filteredTransactions.length} giao dịch`);
    console.log(`💰 Tổng doanh thu: ${formatPrice(revenueStats.totalRevenue)}`);
    
    // Hiển thị toast notification
    toast.success("Báo cáo đã được xuất thành công!", {
      description: `File: ${fileName} | ${filteredTransactions.length} giao dịch | Doanh thu: ${formatPrice(revenueStats.totalRevenue)}`,
      duration: 5000,
    });
  };

  // Xử lý khi chọn trạng thái mới (chưa lưu)
  const handleStatusSelect = (transactionId: string, newStatus: StatusType) => {
    setPendingStatusChanges(prev => ({
      ...prev,
      [transactionId]: newStatus
    }));
  };

  // Xử lý khi bấm nút "Lưu trạng thái"
  const handleSaveStatusChange = async (transactionId: string) => {
    const newStatus = pendingStatusChanges[transactionId];
    if (!newStatus) return;

    // Set email sending status
    setEmailSendingStatus(prev => ({ ...prev, [transactionId]: true }));

    console.log('Saving status change:', transactionId, newStatus);
    const transaction = allTransactions.find(t => t.id === transactionId);
    
    if (transaction) {
      // Gửi email thông báo nếu trạng thái là 'completed' (thanh toán được xác nhận)
      if (newStatus === 'completed' && transaction.customerEmail) {
        try {
          console.log('📧 Gửi email xác nhận thanh toán...');
          await EmailService.sendPaymentConfirmedEmail(
            transaction.customerEmail,
            transaction.customerName,
            transaction.orderNumber,
            transaction.amount,
            transaction.paymentMethod
          );
          console.log('✅ Email xác nhận thanh toán đã gửi thành công');
        } catch (error) {
          console.error('❌ Lỗi gửi email xác nhận thanh toán:', error);
        }
      }
      
      // Gửi email cập nhật trạng thái cho các trạng thái khác
      else if (transaction.customerEmail && newStatus !== transaction.status) {
        try {
          console.log('📧 Gửi email cập nhật trạng thái...');
          await EmailService.sendOrderStatusUpdateEmail(
            transaction.customerEmail,
            transaction.customerName,
            transaction.orderNumber,
            transaction.amount,
            transaction.paymentMethod,
            newStatus
          );
          console.log('✅ Email cập nhật trạng thái đã gửi thành công');
        } catch (error) {
          console.error('❌ Lỗi gửi email cập nhật trạng thái:', error);
        }
      }
    }
    
    updateTransactionStatus(transactionId, newStatus);
    setSelectedTransaction(null);
    
    // Clear email sending status and temp status
    setEmailSendingStatus(prev => {
      const newState = { ...prev };
      delete newState[transactionId];
      return newState;
    });
    
    // Xóa trạng thái tạm thời
    setPendingStatusChanges(prev => {
      const newState = { ...prev };
      delete newState[transactionId];
      return newState;
    });
    
    // Show notification based on status change
    if (transaction) {
      const statusLabels = {
        completed: 'đã được cập nhật thành Thành công',
        processing: 'đã được cập nhật thành Đang xử lý', 
        failed: 'đã được cập nhật thành Thất bại',
        refunded: 'đã được cập nhật thành Hoàn tiền'
      };
      
      console.log(`Giao dịch ${transaction.orderNumber} ${statusLabels[newStatus] || 'đã được cập nhật'}`);
    }
  };

  // Hủy thay đổi trạng thái tạm thời
  const handleCancelStatusChange = (transactionId: string) => {
    setPendingStatusChanges(prev => {
      const newState = { ...prev };
      delete newState[transactionId];
      return newState;
    });
  };

  const StatusBadge = ({ status }: { status: StatusType }) => {
    const config = statusConfig[status];
    
    // Fallback nếu status không tồn tại trong config
    if (!config) {
      return (
        <Badge className="bg-gray-600 text-white">
          <AlertCircle className="w-3 h-3 mr-1" />
          Không xác định
        </Badge>
      );
    }
    
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('home')}
            className="text-white hover:text-yellow-600 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl text-white">Quản lý giao dịch</h1>
            <div className="text-sm text-gray-400 mt-1">
              Tổng cộng {allTransactions.length} giao dịch
            </div>
          </div>
        </div>
        <Button 
          className="bg-yellow-600 hover:bg-yellow-500 text-black"
          onClick={exportToCSV}
        >
          <Download className="w-4 h-4 mr-2" />
          Xuất báo cáo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{statusCounts.total}</div>
            <div className="text-sm text-gray-400">Tổng</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{statusCounts.completed}</div>
            <div className="text-sm text-gray-400">Thành công</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{statusCounts.processing}</div>
            <div className="text-sm text-gray-400">Đang xử lý</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{statusCounts.failed}</div>
            <div className="text-sm text-gray-400">Thất bại</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-400">{statusCounts.refunded}</div>
            <div className="text-sm text-gray-400">Hoàn tiền</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Stats */}
      <Card className="bg-gray-900 border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white text-lg">Thống kê doanh thu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-600/20 rounded-lg border border-green-600/50">
              <div className="text-green-400 text-sm mb-1">Tổng doanh thu</div>
              <div className="text-xl font-bold text-green-400">{formatPrice(revenueStats.totalRevenue)}</div>
              <div className="text-xs text-green-300 mt-1">Từ {statusCounts.completed} giao dịch thành công</div>
            </div>
            
            <div className="p-4 bg-yellow-600/20 rounded-lg border border-yellow-600/50">
              <div className="text-yellow-400 text-sm mb-1">Doanh thu thực nhận</div>
              <div className="text-xl font-bold text-yellow-400">{formatPrice(revenueStats.netRevenue)}</div>
              <div className="text-xs text-yellow-300 mt-1">Sau khi trừ hoàn tiền</div>
            </div>
            
            <div className="p-4 bg-gray-600/20 rounded-lg border border-gray-600/50">
              <div className="text-gray-400 text-sm mb-1">Tổng hoàn tiền</div>
              <div className="text-xl font-bold text-gray-400">{formatPrice(revenueStats.refundedAmount)}</div>
              <div className="text-xs text-gray-300 mt-1">Từ {statusCounts.refunded} giao dịch hoàn</div>
            </div>
            
            <div className="p-4 bg-red-600/20 rounded-lg border border-red-600/50">
              <div className="text-red-400 text-sm mb-1">Tổng giao dịch thất bại</div>
              <div className="text-xl font-bold text-red-400">{formatPrice(revenueStats.failedAmount)}</div>
              <div className="text-xs text-red-300 mt-1">Từ {statusCounts.failed} giao dịch thất bại</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Bộ lọc và tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-white text-sm mb-2 block">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Mã giao dịch, đơn hàng, khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black border-gray-500 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
            
            <div>
              <label className="text-white text-sm mb-2 block">Trạng thái</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all" className="text-white">Tất cả</SelectItem>
                  <SelectItem value="completed" className="text-white">Thành công</SelectItem>
                  <SelectItem value="processing" className="text-white">Đang xử lý</SelectItem>
                  <SelectItem value="failed" className="text-white">Thất bại</SelectItem>
                  <SelectItem value="refunded" className="text-white">Hoàn tiền</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Ngày giao dịch</label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateFilter('');
                }}
                variant="outline" 
                className="w-full bg-gray-800 border-gray-600 text-yellow-600 hover:bg-gray-700"
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Transactions Table */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">
            Danh sách giao dịch ({filteredTransactions.length})
            {searchTerm && (
              <span className="text-yellow-600 text-sm ml-2">
                - Kết quả cho: "{searchTerm}"
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Mã giao dịch</TableHead>
                  <TableHead className="text-gray-300">Mã đơn hàng</TableHead>
                  <TableHead className="text-gray-300">Khách hàng</TableHead>
                  <TableHead className="text-gray-300">Ngày giao dịch</TableHead>
                  <TableHead className="text-gray-300">Số tiền</TableHead>
                  <TableHead className="text-gray-300">Phương thức</TableHead>
                  <TableHead className="text-gray-300">Trạng thái</TableHead>
                  <TableHead className="text-gray-300">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="border-gray-700">
                    <TableCell className="text-white font-mono text-sm">
                      {transaction.id}
                    </TableCell>
                    <TableCell className="text-white font-mono">
                      {transaction.orderNumber}
                    </TableCell>
                    <TableCell className="text-white">
                      <div>
                        <div className="font-medium">{transaction.customerName}</div>
                        <div className="text-sm text-gray-400">{transaction.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {formatPrice(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-white">
                      {transaction.paymentMethod}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={transaction.status} />
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-yellow-600 hover:text-yellow-500"
                            onClick={() => setSelectedTransaction(transaction)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">
                              Cập nhật trạng thái giao dịch
                            </DialogTitle>
                          </DialogHeader>
                          
                          {selectedTransaction && (
                            <div className="space-y-4">
                              <div className="p-4 bg-gray-800 rounded-lg">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <div className="text-gray-400">Mã giao dịch:</div>
                                    <div className="text-white font-mono">{selectedTransaction.id}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-400">Mã đơn hàng:</div>
                                    <div className="text-white font-mono">{selectedTransaction.orderNumber}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-400">Khách hàng:</div>
                                    <div className="text-white">{selectedTransaction.customerName}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-400">Số tiền:</div>
                                    <div className="text-white">{formatPrice(selectedTransaction.amount)}</div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="text-white text-sm mb-2 block">Trạng thái hiện tại:</label>
                                <StatusBadge status={selectedTransaction.status} />
                              </div>

                              <div>
                                <label className="text-white text-sm mb-2 block">Chọn trạng thái mới:</label>
                                <Select 
                                  value={pendingStatusChanges[selectedTransaction.id] || ''}
                                  onValueChange={(newStatus) => {
                                    if (newStatus !== selectedTransaction.status) {
                                      handleStatusSelect(selectedTransaction.id, newStatus as StatusType);
                                    }
                                  }}
                                >
                                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                    <SelectValue placeholder="Chọn trạng thái mới" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-800 border-gray-600">
                                    {Object.entries(statusConfig).map(([status, config]) => {
                                      if (status === selectedTransaction.status) return null;
                                      const Icon = config.icon;
                                      return (
                                        <SelectItem key={status} value={status} className="text-white">
                                          <div className="flex items-center">
                                            <Icon className="w-3 h-3 mr-2" />
                                            {config.label}
                                          </div>
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>

                              {pendingStatusChanges[selectedTransaction.id] && (
                                <div className="space-y-3 p-3 bg-gray-800 rounded border border-yellow-600">
                                  <div className="text-sm text-yellow-400">
                                    Sẽ chuyển thành: <StatusBadge status={pendingStatusChanges[selectedTransaction.id]} />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => handleSaveStatusChange(selectedTransaction.id)}
                                      disabled={emailSendingStatus[selectedTransaction.id]}
                                      className="bg-green-600 hover:bg-green-500 text-white disabled:opacity-50"
                                    >
                                      {emailSendingStatus[selectedTransaction.id] ? (
                                        <>
                                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                          Đang gửi email...
                                        </>
                                      ) : (
                                        <>
                                          <Save className="w-4 h-4 mr-2" />
                                          Lưu trạng thái
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      onClick={() => handleCancelStatusChange(selectedTransaction.id)}
                                      variant="outline"
                                      disabled={emailSendingStatus[selectedTransaction.id]}
                                      className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Hủy
                                    </Button>
                                  </div>
                                  {pendingStatusChanges[selectedTransaction.id] === 'completed' && selectedTransaction.customerEmail && (
                                    <div className="text-sm text-blue-400 flex items-center mt-2">
                                      <Mail className="w-4 h-4 mr-2" />
                                      Sẽ gửi email xác nhận thanh toán đến: {selectedTransaction.customerEmail}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg">
                {allTransactions.length === 0 ? 
                  'Chưa có giao dịch nào' : 
                  'Không tìm thấy giao dịch nào'
                }
              </div>
              <div className="text-gray-500 text-sm mt-2">
                {allTransactions.length === 0 ? 
                  'Các giao dịch từ khách hàng sẽ xuất hiện ở đây' :
                  'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                }
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}