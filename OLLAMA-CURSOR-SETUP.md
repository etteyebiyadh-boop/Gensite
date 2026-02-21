# Ollama + Cursor setup (Iyadh AI, no monthly limits)

Use a **local coding model** with Cursor in this workspace. Your **Iyadh AI** rules and coding-specialist behavior still apply; only the model runs on your PC (no usage caps).

---

## 1. Install Ollama (Windows)

1. Download: **[ollama.com/download/windows](https://ollama.com/download/windows)** → run `OllamaSetup.exe`.
2. Or in **PowerShell** (Admin not required):
   ```powershell
   irm https://ollama.com/install.ps1 | iex
   ```
3. Ollama runs in the background and uses `http://localhost:11434`. Check the system tray for the Ollama icon.

**Rough requirements:** Windows 10 22H2+, 8GB+ RAM, 6GB+ VRAM recommended for larger models.

---

## 2. Pull a coding model

In **PowerShell** or **Command Prompt**:

```powershell
# Strong for code, good balance of speed and quality (recommended)
ollama pull deepseek-coder:6.7b

# Or larger / smaller options:
# ollama pull qwen2.5-coder:7b
# ollama pull codellama:7b
# ollama pull starcoder2:7b
```

Use the **exact model name** (e.g. `deepseek-coder:6.7b`) in Cursor in step 4.

---

## 3. (Optional) If Cursor doesn’t accept localhost — use ngrok

If Cursor gives a “Problem reaching OpenAI” or similar when using `http://localhost:11434`:

1. Sign up at **[ngrok.com](https://ngrok.com)** and get your auth token.
2. Download the Windows binary or install: `winget install ngrok`.
3. Add your token: `ngrok config add-authtoken YOUR_TOKEN`.
4. Expose Ollama:
   ```powershell
   ngrok http 11434
   ```
5. Copy the **HTTPS** URL (e.g. `https://abc123.ngrok.io`) and use it as the **Override Base URL** in Cursor (step 4).  
   With the free tier, this URL changes each time you restart ngrok.

Try **localhost first**; only use ngrok if Cursor clearly can’t reach `http://localhost:11434`.

---

## 4. Configure Cursor to use Ollama

1. Open **Cursor** → **Settings** (Ctrl+,) → **Cursor Settings** or **Models**.
2. **Models**
   - In **Model Names** (or equivalent), add the model you pulled, e.g. `deepseek-coder:6.7b`.
3. **OpenAI API** (or “Custom / OpenAI-compatible”)
   - Enable **Use OpenAI API** (or “Override with custom endpoint”).
   - **Override OpenAI Base URL:**  
     - First try: `http://localhost:11434/v1`  
     - If that fails: your ngrok HTTPS URL + `/v1` (e.g. `https://abc123.ngrok.io/v1`).
   - **API Key:** Cursor often requires a value; for local Ollama you can use any placeholder (e.g. `ollama`). Click **Verify**; it should succeed if Ollama is running and the URL is correct.
4. **Chat model**
   - Set the **Chat** (or default) model to the same name, e.g. `deepseek-coder:6.7b`.
5. Save and close settings.

---

## 5. Use Iyadh AI with the local model

1. Open this project in Cursor: **File → Open Folder → `iyadh AI`**.
2. Use **Chat** or **Composer** as usual. Cursor will send requests to your local Ollama model.
3. Your **Iyadh AI** setup (Codex-style rule + coding-specialist skill) is in this workspace, so the same coding behavior and context are still applied; only the model runs locally with **no monthly limits**.

**Limitations with local models in Cursor:**  
Chat and inline chat work; some Cursor-specific features (e.g. tab completion, certain Composer flows) may not use the custom endpoint. For full “no limits” coding chat, this setup is what you use.

---

## 6. Test the setup

1. **Check Ollama is running**  
   In PowerShell: `ollama list` — you should see your model (e.g. `deepseek-coder:6.7b`). If not, start Ollama from the tray or run `ollama serve`.

2. **Quick API check** (optional)  
   ```powershell
   curl http://localhost:11434/api/tags
   ```  
   You should see a JSON list of models.

3. **Test in Cursor**  
   - Open this folder in Cursor: **File → Open Folder → `iyadh AI`**.
   - Open **Chat** (sidebar) or **Composer** (Ctrl+I).
   - Ensure the **Chat model** is set to your Ollama model (e.g. `deepseek-coder:6.7b`).
   - Send a short coding prompt, e.g.:  
     *"Write a small Python function that returns the factorial of a number."*  
   - You should get code back (Iyadh AI style). If you get a response, the pipeline works.

4. **If it fails**  
   - "Problem reaching OpenAI" → try ngrok (step 3) and use the HTTPS URL + `/v1` as base URL.  
   - No response / timeout → confirm Ollama is running (`ollama list`) and the model name in Cursor matches exactly (e.g. `deepseek-coder:6.7b`).

---

## Quick reference

| Step              | What to do                                      |
|-------------------|--------------------------------------------------|
| Install           | Ollama from ollama.com (Windows)                 |
| Model             | `ollama pull deepseek-coder:6.7b` (or another)   |
| Cursor base URL   | `http://localhost:11434/v1` (or ngrok URL + `/v1`) |
| Cursor model name | Same as pull, e.g. `deepseek-coder:6.7b`         |
| Workspace         | Open `iyadh AI` so Iyadh AI rules apply          |

If something doesn’t work (e.g. “Problem reaching OpenAI”), try the ngrok step and use the HTTPS URL + `/v1` as the base URL.
