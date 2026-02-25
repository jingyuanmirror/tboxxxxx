'use client';

interface RightSidebarProps {
  isVisible: boolean;
}

export default function RightSidebar({ isVisible }: RightSidebarProps) {
  return (
    <div 
      className={`flex-shrink-0 pt-6 pb-5 overflow-y-auto transition-all duration-300 ease-in-out flex flex-col relative z-[5] ${
        isVisible ? 'w-[220px] px-5' : 'w-[50px] px-2.5 overflow-y-hidden'
      }`}
    >
      <div className={`transition-opacity duration-300 ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible h-0'}`}>
        {/* 环境感知 Card */}
        <div 
          className="bg-[rgba(255,255,255,0.75)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.6)] rounded-[20px] p-[12px_12px_18px_12px] mb-[15px] transition-shadow"
          style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0,0,0,0.02)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255,255,255,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0,0,0,0.02)';
          }}
        >
          <div className="text-[13px] font-bold mb-3 text-[#1d1d1f] block border-b border-[rgba(0,0,0,0.06)] pb-2 uppercase tracking-[0.5px]">
            环境感知
          </div>

          <div className="mb-[15px] pb-2.5 border-b border-dashed border-[rgba(0,0,0,0.06)] last:mb-0 last:pb-0 last:border-b-0">
            <div className="text-[13px] text-[#444] leading-normal mb-1.5">
              AI 领域正转向<strong>垂直应用</strong>，建议聚焦竞品分析的差异化，同时利用 Agent Hub 中的"数据分析师"来验证成本模型。
            </div>
            <span className="text-[10px] bg-[rgba(0,0,0,0.04)] px-2 py-0.5 rounded-xl text-[#6a6e73] font-semibold mt-1 inline-block">
              Insight / AI 趋势
            </span>
          </div>

          <div className="mb-[15px] pb-2.5 border-b border-dashed border-[rgba(0,0,0,0.06)] last:mb-0 last:pb-0 last:border-b-0">
            <div className="text-[13px] text-[#444] leading-normal mb-1.5">
              市场趋势：Q4 订单量环比增长 10%，中高端市场竞争加剧。请确保您的推广方案能有效区分目标客户群。
            </div>
            <span className="text-[10px] bg-[rgba(0,0,0,0.04)] px-2 py-0.5 rounded-xl text-[#6a6e73] font-semibold mt-1 inline-block">
              Market Insight / 增长
            </span>
          </div>

          <div className="mb-[15px] pb-2.5 border-b border-dashed border-[rgba(0,0,0,0.06)] last:mb-0 last:pb-0 last:border-b-0">
            <div className="text-[13px] text-[#444] leading-normal mb-1.5">
              系统检测到您最近打开了 15 份关于"低功耗"的文档，这已被纳入您的<strong>核心关注点</strong>记忆。
            </div>
            <span className="text-[10px] bg-[rgba(0,0,0,0.04)] px-2 py-0.5 rounded-xl text-[#6a6e73] font-semibold mt-1 inline-block">
              Memory / 重点关注
            </span>
          </div>
        </div>

        {/* 私人提醒 Card */}
        <div 
          className="bg-[rgba(255,255,255,0.75)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.6)] rounded-[20px] p-[18px] mb-[15px] transition-shadow"
          style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0,0,0,0.02)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255,255,255,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0,0,0,0.02)';
          }}
        >
          <div className="text-[13px] font-bold mb-3 text-[#1d1d1f] block border-b border-[rgba(0,0,0,0.06)] pb-2 uppercase tracking-[0.5px]">
            私人提醒
          </div>
          <div className="text-[13px] text-[#444] leading-normal mb-1.5">
            今天 02:00 PM。享受这片刻的光影，但别忘了<strong>竞品报告</strong>截止时间是明天。您需要将完成的邮件发送给所有经理。
          </div>
          <span className="text-[10px] bg-[rgba(0,0,0,0.04)] px-2 py-0.5 rounded-xl text-[#6a6e73] font-semibold mt-1 inline-block">
            Priority
          </span>
        </div>

        {/* 协作进度 Card */}
        <div 
          className="bg-[rgba(255,255,255,0.75)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.6)] rounded-[20px] p-[12px_12px_18px_12px] mb-[15px] transition-shadow"
          style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0,0,0,0.02)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255,255,255,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0,0,0,0.02)';
          }}
        >
          <div className="text-[13px] font-bold mb-3 text-[#1d1d1f] block border-b border-[rgba(0,0,0,0.06)] pb-2 uppercase tracking-[0.5px]">
            协作进度
          </div>

          <div className="mb-[15px] pb-2.5 border-b border-dashed border-[rgba(0,0,0,0.06)] last:mb-0 last:pb-0 last:border-b-0">
            <div className="text-[13px] text-[#444] leading-normal mb-1.5">
              <strong>项目：《Q4 产品推广方案》</strong> - 核心设计稿已完成 80%，市场部等待您的最终确认。
            </div>
            <span className="text-[10px] bg-[rgba(0,0,0,0.04)] px-2 py-0.5 rounded-xl text-[#6a6e73] font-semibold mt-1 inline-block">
              Project Update
            </span>
          </div>

          <div className="mb-[15px] pb-2.5 border-b border-dashed border-[rgba(0,0,0,0.06)] last:mb-0 last:pb-0 last:border-b-0">
            <div className="text-[13px] text-[#444] leading-normal mb-1.5">
              您有一个未处理的 Gmail 邮件：关于<strong>预算审批</strong>的回复，标记为紧急。
            </div>
            <span className="text-[10px] bg-[rgba(0,0,0,0.04)] px-2 py-0.5 rounded-xl text-[#6a6e73] font-semibold mt-1 inline-block">
              Email Alert
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
