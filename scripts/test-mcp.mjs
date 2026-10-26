const BASE_URL = 'http://127.0.0.1:3009';

async function testMcp() {
  console.log('--- Testing MCP Endpoint over HTTP ---\n');

  // 1. GET Manifest
  const resGet = await fetch(`${BASE_URL}/.well-known/mcp`);
  const manifest = await resGet.json();
  console.log('1. GET /.well-known/mcp:', resGet.status, manifest.name, 'tools count:', manifest.tools.length);

  // 2. Initialize Handshake
  const resInit = await fetch(`${BASE_URL}/.well-known/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '2024-11-05' },
    }),
  });
  const initResult = await resInit.json();
  console.log('2. POST initialize:', resInit.status, initResult.result?.serverInfo);

  // 3. Tools List
  const resTools = await fetch(`${BASE_URL}/.well-known/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
    }),
  });
  const toolsResult = await resTools.json();
  console.log('3. POST tools/list:', resTools.status, 'tools:', toolsResult.result?.tools?.map(t => t.name));

  // 4. Tool Call: list_villas
  const resCall1 = await fetch(`${BASE_URL}/.well-known/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: { name: 'list_villas', arguments: { district: 'Son Tra' } },
    }),
  });
  const call1Result = await resCall1.json();
  const parsed1 = JSON.parse(call1Result.result?.content?.[0]?.text || '{}');
  console.log('4. Call list_villas (Son Tra):', parsed1.total, 'villas found');

  // 5. Tool Call: get_villa_details
  const resCall2 = await fetch(`${BASE_URL}/.well-known/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: { name: 'get_villa_details', arguments: { villa_id: 'B1' } },
    }),
  });
  const call2Result = await resCall2.json();
  const parsed2 = JSON.parse(call2Result.result?.content?.[0]?.text || '{}');
  console.log('5. Call get_villa_details (B1):', parsed2.villa?.name, '| Location:', parsed2.villa?.location);

  // 6. Tool Call: calculate_price
  const resCall3 = await fetch(`${BASE_URL}/.well-known/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: { name: 'calculate_price', arguments: { villa_id: 'B2', nights: 3, guests: 8 } },
    }),
  });
  const call3Result = await resCall3.json();
  const parsed3 = JSON.parse(call3Result.result?.content?.[0]?.text || '{}');
  console.log('6. Call calculate_price (B2, 3 nights):', parsed3.totalEstimatedVnd?.toLocaleString(), 'VND (~$' + parsed3.totalEstimatedUsd + ')');

  // 7. Tool Call: get_contact_info
  const resCall4 = await fetch(`${BASE_URL}/.well-known/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: { name: 'get_contact_info' },
    }),
  });
  const call4Result = await resCall4.json();
  const parsed4 = JSON.parse(call4Result.result?.content?.[0]?.text || '{}');
  console.log('7. Call get_contact_info:', parsed4.brand, '| Hotline:', parsed4.hotline);
}

testMcp().catch(console.error);
