import Layout from '@/shared/components/layout/Layout'

export default function Home() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">
                CATV工事管理システム
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">1</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        工事調査依頼
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        新規依頼登録
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="/orders" className="font-medium text-blue-600 hover:text-blue-500">
                    依頼管理画面へ
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">2</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        工事日程調整
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        スケジュール管理
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="/schedule" className="font-medium text-purple-600 hover:text-purple-500">
                    スケジュール画面へ
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">3</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        申請番号管理
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        許可申請状況
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="/applications" className="font-medium text-orange-600 hover:text-orange-500">
                    申請管理画面へ
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">4</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        アカウント管理
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        管理者・協力会社
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="/contractor-management" className="font-medium text-green-600 hover:text-green-500">
                    アカウント管理画面へ
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* 工事進捗サマリ */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  工事進捗サマリ
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-400">
                    <thead>
                      <tr className="bg-yellow-200">
                        <th className="px-2 py-1 text-xs font-bold text-black border border-gray-400 text-center">工事内容(全体)</th>
                        <th className="px-2 py-1 text-xs font-bold text-black border border-gray-400 text-center">工事許可(元工事)</th>
                        <th className="px-2 py-1 text-xs font-bold text-black border border-gray-400 text-center">工事許可(その他工事)</th>
                        <th className="px-2 py-1 text-xs font-bold text-black border border-gray-400 text-center">工事許可(ネット通り)</th>
                        <th className="px-2 py-1 text-xs font-bold text-black border border-gray-400 text-center">工事作業</th>
                        <th className="px-2 py-1 text-xs font-bold text-black border border-gray-400 text-center">宅内作業/サービス</th>
                        <th className="px-2 py-1 text-xs font-bold text-black border border-gray-400 text-center">完工準備対応</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-blue-100">
                        <td className="px-2 py-1 text-xs font-bold text-black border border-gray-400 text-center">193</td>
                        <td className="px-2 py-1 text-xs font-bold text-black border border-gray-400 text-center">175</td>
                        <td className="px-2 py-1 text-xs font-bold text-black border border-gray-400 text-center">18</td>
                        <td className="px-2 py-1 text-xs font-bold text-black border border-gray-400 text-center">131</td>
                        <td className="px-2 py-1 text-xs font-bold text-black border border-gray-400 text-center">232</td>
                        <td className="px-2 py-1 text-xs font-bold text-black border border-gray-400 text-center">1</td>
                        <td className="px-2 py-1 text-xs font-bold text-black border border-gray-400 text-center">5</td>
                      </tr>
                      <tr className="bg-white">
                        <th className="px-2 py-1 text-xs font-bold text-black border border-gray-400 text-left">工事予定数</th>
                        <th className="px-2 py-1 text-xs font-bold text-black border border-gray-400 text-left">工事許可(元工事)</th>
                        <th className="px-2 py-1 text-xs font-bold text-black border border-gray-400 text-left">工事許可適格等候</th>
                        <th className="px-2 py-1 text-xs font-bold text-black border border-gray-400 text-left">未調停許可(ネット通り)</th>
                        <th className="px-2 py-1 text-xs font-bold text-black border border-gray-400 text-left">工事総数領域</th>
                        <th className="px-2 py-1 text-xs font-bold text-black border border-gray-400 text-left">宅内領域(サービス)</th>
                        <th className="px-2 py-1 text-xs font-bold text-black border border-gray-400 text-left">その他(全体解除)</th>
                      </tr>
                      <tr className="bg-gray-100">
                        <td className="px-2 py-1 text-xs text-black border border-gray-400 text-center">15</td>
                        <td className="px-2 py-1 text-xs text-black border border-gray-400 text-center">12</td>
                        <td className="px-2 py-1 text-xs text-black border border-gray-400 text-center">8</td>
                        <td className="px-2 py-1 text-xs text-black border border-gray-400 text-center">5</td>
                        <td className="px-2 py-1 text-xs text-black border border-gray-400 text-center">18</td>
                        <td className="px-2 py-1 text-xs text-black border border-gray-400 text-center">22</td>
                        <td className="px-2 py-1 text-xs text-black border border-gray-400 text-center">14</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  ※ リアルタイムで進捗状況が更新されます
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  システム概要
                </h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    KCT（倉敷ケーブルテレビ）の工事業務フローに基づいた管理システムです。
                    工事調査依頼から完了まで、関係者間の連携を効率化します。
                  </p>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">主要機能</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-blue-600 text-xs font-bold">✓</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-700 font-medium">工事依頼管理</p>
                        <p className="text-xs text-gray-500">アポイント履歴、進捗管理</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                          <span className="text-purple-600 text-xs font-bold">✓</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-700 font-medium">スケジュール調整</p>
                        <p className="text-xs text-gray-500">月/週/日表示、除外日管理</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                          <span className="text-orange-600 text-xs font-bold">✓</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-700 font-medium">申請番号管理</p>
                        <p className="text-xs text-gray-500">中電/NTT共架・添架許可</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                          <span className="text-green-600 text-xs font-bold">✓</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-700 font-medium">アカウント管理</p>
                        <p className="text-xs text-gray-500">管理者・協力会社・班管理</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">協力会社・班構成</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-32">
                        直営班
                      </span>
                      <span className="ml-2 text-xs text-gray-600">A班、B班</span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-32">
                        栄光電気通信
                      </span>
                      <span className="ml-2 text-xs text-gray-600">1班</span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 w-32">
                        スライヴ
                      </span>
                      <span className="ml-2 text-xs text-gray-600">第1班</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}