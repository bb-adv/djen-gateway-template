import type { VercelRequest, VercelResponse } from "@vercel/node";

const DJEN_BASE_URL = "https://comunicaapi.pje.jus.br/api/v1/comunicacao";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const API_KEY = process.env.DJEN_GATEWAY_KEY;
  const suppliedKey = req.headers["x-api-key"];

  if (!API_KEY || suppliedKey !== API_KEY) {
    return res.status(401).json({ ok: false, error: "UNAUTHORIZED", message: "Senha invalida ou ausente." });
  }

  const { numeroOab, ufOab, dataDisponibilizacaoInicio, dataDisponibilizacaoFim, pagina, itensPorPagina } = req.query;

  const url = new URL(DJEN_BASE_URL);
  if (numeroOab) url.searchParams.set("numeroOab", String(numeroOab));
  if (ufOab) url.searchParams.set("ufOab", String(ufOab).toUpperCase());
  if (dataDisponibilizacaoInicio) url.searchParams.set("dataDisponibilizacaoInicio", String(dataDisponibilizacaoInicio));
  if (dataDisponibilizacaoFim) url.searchParams.set("dataDisponibilizacaoFim", String(dataDisponibilizacaoFim));
  if (pagina) url.searchParams.set("pagina", String(pagina));
  if (itensPorPagina) url.searchParams.set("itensPorPagina", String(itensPorPagina));

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Accept": "application/json" }
    });

    const responseText = await response.text();

    if (!response.ok) {
      return res.status(502).json({ ok: false, error: "ERRO_NO_TRIBUNAL", status: response.status });
    }

    const data = JSON.parse(responseText);
    return res.status(200).json({ ok: true, source: "CNJ-DJEN", data });

  } catch (error) {
    return res.status(500).json({ ok: false, error: "ERRO_INTERNO" });
  }
}
