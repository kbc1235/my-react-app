// 이 파일은 서버리스 함수로 배포하거나 Express 서버의 일부로 사용할 수 있습니다.
// 여기서는 백엔드 없이 작업한다고 했으므로 참고용으로만 제공합니다.

import { Client } from '@notionhq/client';

// API 키와 데이터베이스 ID를 환경 변수에서 가져옵니다.
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Notion 클라이언트 초기화
const notion = new Client({ auth: NOTION_API_KEY });

/**
 * 데이터베이스에서 데이터를 가져오는 핸들러
 */
export async function GET(request) {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
    });
    
    return new Response(JSON.stringify(response.results), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Notion API 오류:', error);
    return new Response(JSON.stringify({ error: '데이터를 가져오는 데 실패했습니다.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

/**
 * 데이터베이스에 새 항목을 추가하는 핸들러
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    const response = await notion.pages.create({
      parent: {
        database_id: DATABASE_ID,
      },
      properties: body,
    });
    
    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Notion API 오류:', error);
    return new Response(JSON.stringify({ error: '데이터 추가에 실패했습니다.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

/**
 * 데이터베이스 항목을 업데이트하는 핸들러
 */
export async function PUT(request) {
  try {
    const { id, properties } = await request.json();
    
    const response = await notion.pages.update({
      page_id: id,
      properties,
    });
    
    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Notion API 오류:', error);
    return new Response(JSON.stringify({ error: '데이터 업데이트에 실패했습니다.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

/**
 * 데이터베이스 항목을 삭제(아카이브)하는 핸들러
 */
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    
    const response = await notion.pages.update({
      page_id: id,
      archived: true,
    });
    
    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Notion API 오류:', error);
    return new Response(JSON.stringify({ error: '데이터 삭제에 실패했습니다.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 