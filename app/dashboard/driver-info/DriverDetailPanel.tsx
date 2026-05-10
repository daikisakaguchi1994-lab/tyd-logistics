'use client';

import { useState } from 'react';
import { PLAYERS } from '@/src/mockData';
import type { DriverFullRecord } from '@/src/types';
import { calcDaysLeft, calcSeverity } from '@/lib/utils';
import { InfoRow, CopyButton, CopyableRow, SeverityBadge } from '@/components/ui';

type InfoTab = 'personal' | 'vehicle' | 'qualifications';

export function DriverDetailPanel({ record, onClose }: { record: DriverFullRecord; onClose: () => void }) {
  const [tab, setTab] = useState<InfoTab>('personal');
  const player = PLAYERS.find(p => p.name === record.personal.driverName);
  const { personal: info, vehicle: veh, qualifications: qual } = record;

  const tabs: { key: InfoTab; label: string; icon: string }[] = [
    { key: 'personal', label: 'ドライバー情報', icon: '👤' },
    { key: 'vehicle', label: '車両情報', icon: '🚐' },
    { key: 'qualifications', label: '資格・保険', icon: '📋' },
  ];

  return (
    <div className="card overflow-hidden">
      {/* ヘッダー */}
      <div className="p-4 flex items-center justify-between border-b border-b-border-default">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center text-base font-bold flex-shrink-0 rounded-md"
            style={{ background: player?.color || 'var(--brand-crimson)', color: '#fff' }}>
            {info.driverName.charAt(0)}
          </div>
          <div>
            <h2 className="text-base font-bold text-primary">{info.driverName}</h2>
            <p className="text-[11px] text-muted">{player?.character} / {info.contractType} / 入社 {info.joinDate}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 cursor-pointer text-muted bg-none border-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* タブ */}
      <div className="flex border-b border-b-border-default">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium cursor-pointer transition-colors border-0 rounded-none ${tab === t.key ? 'bg-elevated text-primary border-b-2 border-b-crimson' : 'bg-transparent text-muted border-b-2 border-b-transparent'}`}>
            <span className="text-sm">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4">
        {tab === 'personal' && (
          <>
            <div className="p-4 bg-elevated rounded-md">
              <h3 className="text-xs font-semibold mb-2 text-secondary">基本情報</h3>
              <InfoRow label="氏名" value={info.driverName} />
              <InfoRow label="生年月日" value={info.birthDate} mono />
              <InfoRow label="電話番号" value={info.phone} mono />
              <InfoRow label="メール" value={info.email} />
              <InfoRow label="住所" value={info.address} />
              <InfoRow label="入社日" value={info.joinDate} mono />
              <InfoRow label="契約形態" value={info.contractType} />
            </div>

            {info.bankAccount && (
              <div className="p-4 bg-elevated rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-secondary">振込口座情報</h3>
                  <CopyButton
                    label="全てコピー"
                    value={[
                      `銀行名: ${info.bankAccount.bankName}`,
                      `支店名: ${info.bankAccount.branchName}`,
                      `口座種別: ${info.bankAccount.accountType}`,
                      `口座番号: ${info.bankAccount.accountNumber}`,
                      `口座名義: ${info.bankAccount.accountHolder}`,
                    ].join('\n')}
                  />
                </div>
                <CopyableRow label="銀行名" value={info.bankAccount.bankName} />
                <CopyableRow label="支店名" value={info.bankAccount.branchName} />
                <CopyableRow label="口座種別" value={info.bankAccount.accountType} />
                <CopyableRow label="口座番号" value={info.bankAccount.accountNumber} mono />
                <CopyableRow label="口座名義" value={info.bankAccount.accountHolder} />
              </div>
            )}

            <div className="p-4 bg-elevated rounded-md">
              <h3 className="text-xs font-semibold mb-2 text-secondary">緊急連絡先</h3>
              <InfoRow label="氏名" value={info.emergencyContact.name} />
              <InfoRow label="続柄" value={info.emergencyContact.relation} />
              <InfoRow label="電話番号" value={info.emergencyContact.phone} mono />
            </div>

            {info.notes && (
              <div className="p-4 bg-elevated rounded-md">
                <h3 className="text-xs font-semibold mb-2 text-secondary">備考</h3>
                <p className="text-sm text-primary">{info.notes}</p>
              </div>
            )}
          </>
        )}

        {tab === 'vehicle' && (
          <>
            <div className="p-4 bg-elevated rounded-md">
              <h3 className="text-xs font-semibold mb-2 text-secondary">車両基本情報</h3>
              <InfoRow label="ナンバー" value={veh.plateNumber} mono />
              <InfoRow label="車種" value={veh.model} />
              <InfoRow label="車体タイプ" value={veh.bodyType} />
              <InfoRow label="年式" value={`${veh.year}年`} mono />
              <InfoRow label="色" value={veh.color} />
            </div>

            <div className="p-4 bg-elevated rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-secondary">リース情報</h3>
                <SeverityBadge severity={calcSeverity(veh.leaseEnd)} daysLeft={calcDaysLeft(veh.leaseEnd)} />
              </div>
              <InfoRow label="リース会社" value={veh.leaseCompany} />
              <InfoRow label="リース開始" value={veh.leaseStart} mono />
              <InfoRow label="リース満了" value={veh.leaseEnd} mono warn={calcSeverity(veh.leaseEnd) !== 'ok'} />
            </div>

            <div className="p-4 bg-elevated rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-secondary">車検情報</h3>
                <SeverityBadge severity={calcSeverity(veh.inspection.expiryDate)} daysLeft={calcDaysLeft(veh.inspection.expiryDate)} />
              </div>
              <InfoRow label="前回車検日" value={veh.inspection.lastDate} mono />
              <InfoRow label="車検満了日" value={veh.inspection.expiryDate} mono warn={calcSeverity(veh.inspection.expiryDate) !== 'ok'} />
              <InfoRow label="整備工場" value={veh.inspection.shop} />
            </div>
          </>
        )}

        {tab === 'qualifications' && (
          <>
            <div className="p-4 bg-elevated rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-secondary">運転免許証</h3>
                <SeverityBadge severity={calcSeverity(qual.license.expiryDate)} daysLeft={calcDaysLeft(qual.license.expiryDate)} />
              </div>
              <InfoRow label="免許番号" value={qual.license.number} mono />
              <InfoRow label="免許種別" value={qual.license.type} />
              <InfoRow label="交付日" value={qual.license.issueDate} mono />
              <InfoRow label="有効期限" value={qual.license.expiryDate} mono warn={calcSeverity(qual.license.expiryDate) !== 'ok'} />
            </div>

            <div className="p-4 bg-elevated rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-secondary">自賠責保険（強制）</h3>
                <SeverityBadge severity={calcSeverity(qual.jibaiseki.expiryDate)} daysLeft={calcDaysLeft(qual.jibaiseki.expiryDate)} />
              </div>
              <InfoRow label="保険会社" value={qual.jibaiseki.company} />
              <InfoRow label="証券番号" value={qual.jibaiseki.policyNumber} mono />
              <InfoRow label="保険開始" value={qual.jibaiseki.startDate} mono />
              <InfoRow label="有効期限" value={qual.jibaiseki.expiryDate} mono warn={calcSeverity(qual.jibaiseki.expiryDate) !== 'ok'} />
            </div>

            <div className="p-4 bg-elevated rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-secondary">任意保険</h3>
                <SeverityBadge severity={calcSeverity(qual.voluntaryInsurance.expiryDate)} daysLeft={calcDaysLeft(qual.voluntaryInsurance.expiryDate)} />
              </div>
              <InfoRow label="保険会社" value={qual.voluntaryInsurance.company} />
              <InfoRow label="証券番号" value={qual.voluntaryInsurance.policyNumber} mono />
              <InfoRow label="保険開始" value={qual.voluntaryInsurance.startDate} mono />
              <InfoRow label="有効期限" value={qual.voluntaryInsurance.expiryDate} mono warn={calcSeverity(qual.voluntaryInsurance.expiryDate) !== 'ok'} />
              {qual.voluntaryInsurance.coverageAmount && (
                <InfoRow label="補償内容" value={qual.voluntaryInsurance.coverageAmount} />
              )}
            </div>

            {qual.cargoInsurance && (
              <div className="p-4 bg-elevated rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-secondary">貨物保険</h3>
                  <SeverityBadge severity={calcSeverity(qual.cargoInsurance.expiryDate)} daysLeft={calcDaysLeft(qual.cargoInsurance.expiryDate)} />
                </div>
                <InfoRow label="保険会社" value={qual.cargoInsurance.company} />
                <InfoRow label="証券番号" value={qual.cargoInsurance.policyNumber} mono />
                <InfoRow label="保険開始" value={qual.cargoInsurance.startDate} mono />
                <InfoRow label="有効期限" value={qual.cargoInsurance.expiryDate} mono warn={calcSeverity(qual.cargoInsurance.expiryDate) !== 'ok'} />
                {qual.cargoInsurance.coverageAmount && (
                  <InfoRow label="補償額" value={qual.cargoInsurance.coverageAmount} />
                )}
              </div>
            )}

            {qual.otherCerts.length > 0 && (
              <div className="p-4 bg-elevated rounded-md">
                <h3 className="text-xs font-semibold mb-2 text-secondary">その他保有資格</h3>
                {qual.otherCerts.map((cert, i) => (
                  <div key={i} className={i > 0 ? 'mt-3 pt-3 border-t border-t-border-subtle' : ''}>
                    <InfoRow label="資格名" value={cert.name} />
                    <InfoRow label="資格番号" value={cert.number} mono />
                    <InfoRow label="有効期限" value={cert.expiryDate === '9999-12-31' ? '無期限' : cert.expiryDate} mono />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
