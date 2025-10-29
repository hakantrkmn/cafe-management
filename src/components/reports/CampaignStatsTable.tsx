"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportsData } from "@/hooks/useReportsData";
import { formatPrice } from "@/lib/formatters";
import { Gift } from "lucide-react";

interface CampaignStatsTableProps {
  data: ReportsData;
}

export function CampaignStatsTable({ data }: CampaignStatsTableProps) {
  const { campaignStats } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Kampanya İstatistikleri
        </CardTitle>
      </CardHeader>
      <CardContent>
        {campaignStats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Seçilen dönemde kampanya kullanımı bulunamadı</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kampanya Adı</TableHead>
                <TableHead className="text-center">Kullanım Sayısı</TableHead>
                <TableHead className="text-right">Toplam Gelir</TableHead>
                <TableHead className="text-right">
                  Ortalama Sipariş Değeri
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaignStats.map((campaign) => (
                <TableRow key={campaign.campaignId}>
                  <TableCell className="font-medium">
                    {campaign.campaignName}
                  </TableCell>
                  <TableCell className="text-center">
                    {campaign.totalUsed}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPrice(campaign.totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(campaign.averageOrderValue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

