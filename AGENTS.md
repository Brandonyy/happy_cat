# Repository Notes

## Cocos Creator MCP

- This project uses `harady/cocos-creator-mcp`.
- MCP config is in `.mcp.json`.
- Service URL: `http://127.0.0.1:3799/mcp`.
- Health check: `http://127.0.0.1:3799/health`.
- If no native `mcp__cocos...` tools are exposed in Codex, call the MCP server directly through the Streamable HTTP endpoint above.
- Before Cocos scene/node/asset work, verify the service is running with the health check. Expected shape: `{"status":"ok","tools":64}`.
