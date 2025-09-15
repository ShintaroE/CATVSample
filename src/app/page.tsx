import Layout from '@/components/Layout'

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
              <div className="text-sm text-gray-600">
                KCT（倉敷ケーブルテレビ）業務効率化
              </div>
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
                  <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
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
                  <a href="#" className="font-medium text-orange-600 hover:text-orange-500">
                    申請管理画面へ
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">4</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        アポイント記録
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        顧客対応履歴
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="#" className="font-medium text-red-600 hover:text-red-500">
                    履歴管理画面へ
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">5</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        工事業者管理
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        業者別進捗確認
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="#" className="font-medium text-gray-600 hover:text-gray-500">
                    業者管理画面へ
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 宅内引込進捗サマリ */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  宅内引込進捗サマリ
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase border">
                          項目
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase border">
                          調査中
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase border">
                          許可申請中
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase border">
                          工事予定
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase border">
                          工事中
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase border">
                          完了
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase border">
                          保留
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase border">
                          合計
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr className="bg-gray-50">
                        <td className="px-3 py-2 text-sm font-medium text-gray-900 border">共架工事</td>
                        <td className="px-3 py-2 text-sm text-center text-gray-900 border">2</td>
                        <td className="px-3 py-2 text-sm text-center text-yellow-600 border">5</td>
                        <td className="px-3 py-2 text-sm text-center text-blue-600 border">8</td>
                        <td className="px-3 py-2 text-sm text-center text-orange-600 border">3</td>
                        <td className="px-3 py-2 text-sm text-center text-green-600 border">12</td>
                        <td className="px-3 py-2 text-sm text-center text-red-600 border">1</td>
                        <td className="px-3 py-2 text-sm text-center font-medium text-gray-900 border">31</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-sm font-medium text-gray-900 border">宅内引込</td>
                        <td className="px-3 py-2 text-sm text-center text-gray-900 border">4</td>
                        <td className="px-3 py-2 text-sm text-center text-yellow-600 border">7</td>
                        <td className="px-3 py-2 text-sm text-center text-blue-600 border">15</td>
                        <td className="px-3 py-2 text-sm text-center text-orange-600 border">6</td>
                        <td className="px-3 py-2 text-sm text-center text-green-600 border">18</td>
                        <td className="px-3 py-2 text-sm text-center text-red-600 border">2</td>
                        <td className="px-3 py-2 text-sm text-center font-medium text-gray-900 border">52</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-3 py-2 text-sm font-medium text-gray-900 border">撤去工事</td>
                        <td className="px-3 py-2 text-sm text-center text-gray-900 border">1</td>
                        <td className="px-3 py-2 text-sm text-center text-yellow-600 border">2</td>
                        <td className="px-3 py-2 text-sm text-center text-blue-600 border">3</td>
                        <td className="px-3 py-2 text-sm text-center text-orange-600 border">1</td>
                        <td className="px-3 py-2 text-sm text-center text-green-600 border">8</td>
                        <td className="px-3 py-2 text-sm text-center text-red-600 border">0</td>
                        <td className="px-3 py-2 text-sm text-center font-medium text-gray-900 border">15</td>
                      </tr>
                      <tr className="bg-blue-50 font-semibold">
                        <td className="px-3 py-2 text-sm font-bold text-gray-900 border">合計</td>
                        <td className="px-3 py-2 text-sm text-center font-bold text-gray-900 border">7</td>
                        <td className="px-3 py-2 text-sm text-center font-bold text-yellow-700 border">14</td>
                        <td className="px-3 py-2 text-sm text-center font-bold text-blue-700 border">26</td>
                        <td className="px-3 py-2 text-sm text-center font-bold text-orange-700 border">10</td>
                        <td className="px-3 py-2 text-sm text-center font-bold text-green-700 border">38</td>
                        <td className="px-3 py-2 text-sm text-center font-bold text-red-700 border">3</td>
                        <td className="px-3 py-2 text-sm text-center font-bold text-gray-900 border">98</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  ※ リアルタイムで進捗状況が更新されます（A1:H4 サマリ）
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  業務フロー概要
                </h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    KCT（倉敷ケーブルテレビ）の工事業務フローに基づいた管理システムです。
                    工事調査依頼から完了まで、関係者間の連携を効率化します。
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    パワーケーブル（直営班）
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    栄光電気通信
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    スライヴ
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    中国電力・NTT連携
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}