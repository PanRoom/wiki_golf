// ========== mypage.js (ユーザー情報ページ専用: mypage.html) ==========

import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    const myScoresTable = document.getElementById('my-scores-table');
    
    // マイページのテーブルが存在するページでのみ実行
    if (myScoresTable) {
        // Supabaseのセッションが利用可能になるのを待つ
        const { data: { user } } = await supabase.auth.getUser();

        // ログインしていない場合はトップページにリダイレクト
        if (!user) {
            alert('このページを表示するにはログインが必要です。');
            window.location.href = 'index.html';
            return;
        }
        
        // ユーザー名を表示
        const usernameEl = document.getElementById('mypage-username');
        if (usernameEl) {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', user.id)
                .single();
            if (profileError) console.error('プロフィール取得エラー:', profileError.message);
            usernameEl.textContent = profile ? profile.username : '不明なユーザー';
        }

        // 自分のスコアを取得して表示
        fetchMyScores(myScoresTable, user.id);
    }
});

async function fetchMyScores(myScoresTable, userId) {
    const tableBody = myScoresTable.querySelector('tbody');
    tableBody.innerHTML = '<tr><td colspan="4">記録を読み込んでいます...</td></tr>';

    try {
        const { data: scores, error } = await supabase
            .from('scores')
            .select('start_page, goal_page, click_count, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        tableBody.innerHTML = ''; // 一旦空にする

        if (!scores || scores.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">まだプレイ記録がありません。</td></tr>';
            return;
        }

        scores.forEach(score => {
            const row = tableBody.insertRow();
            const date = new Date(score.created_at).toLocaleString('ja-JP');
            row.innerHTML = `
                <td>${date}</td>
                <td>${escapeHTML(score.start_page)}</td>
                <td>${escapeHTML(score.goal_page)}</td>
                <td>${escapeHTML(score.click_count)}</td>
            `;
        });
    } catch (error) {
        console.error('記録の取得に失敗:', error.message);
        tableBody.innerHTML = '<tr><td colspan="4">記録の取得に失敗しました。</td></tr>';
    }
}

// HTMLエスケープ用の補助関数
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}