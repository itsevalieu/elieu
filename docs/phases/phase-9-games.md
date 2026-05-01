# Phase 9 — Games Integration

**Status:** `[ ]` Not started
**Repo areas:** `frontend/newsletter/`, `backend/newsletter-api/`
**Depends on:** Phase 2, Phase 4

## Goal

Support embedded playable games in the newsletter — either hosted as static files in S3 or linked externally. Games appear as a content category with their own post format.

---

## Architecture

```mermaid
flowchart LR
    subgraph admin [frontend/admin]
        GF[Game post form\nformat=embedded-game]
        GU[Game file upload\n.zip or index.html]
    end

    subgraph api [newsletter-api]
        PS[Presigned URL endpoint]
        UZ[Unzip service\nserver-side extraction]
    end

    subgraph storage [AWS]
        S3[S3 Bucket\ngames/uuid/index.html]
        CF[CloudFront\ngames.evalieu.com]
    end

    subgraph public [frontend/newsletter]
        GE[GameEmbed component\niframe or canvas or link]
        GP[/categories/games page]
    end

    GF -->|metadata| api
    GU -->|.zip file| PS
    PS --> S3
    UZ --> S3
    S3 --> CF
    CF --> GE
    GP --> api
```

## Technical Choices

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Game hosting | S3 bucket with CloudFront CDN, path prefix `games/{uuid}/` | Fast global delivery; each game gets its own isolated directory |
| Embed method | `<iframe>` with `sandbox` attribute (primary); `<canvas>` for special cases | iframe is safest — sandboxed, no cross-origin data access; canvas for WebGL games |
| Zip extraction | Java `ZipInputStream` on the backend; extract to S3; validate `index.html` exists | Users upload a zip of game files; server validates and extracts |
| File validation | Allowlist: `.html`, `.js`, `.css`, `.json`, `.png`, `.jpg`, `.svg`, `.gif`, `.woff2`, `.wav`, `.mp3`, `.ogg` | Prevent executable or dangerous file types |
| Max upload size | 50MB per game zip | Reasonable limit for HTML5 games |

---

## Tasks

### 1. Backend — Game Upload Service

- [ ] **`GameUploadService.java`**:

```java
public String uploadGameZip(MultipartFile file) {
    // Validate
    if (file.getSize() > 50 * 1024 * 1024) throw new IllegalArgumentException("Max 50MB");
    if (!file.getOriginalFilename().endsWith(".zip")) throw new IllegalArgumentException("Must be .zip");

    String gameId = UUID.randomUUID().toString();
    String prefix = "games/" + gameId + "/";

    try (ZipInputStream zis = new ZipInputStream(file.getInputStream())) {
        ZipEntry entry;
        boolean hasIndex = false;
        Set<String> allowedExtensions = Set.of(
            ".html", ".js", ".css", ".json", ".png", ".jpg", ".jpeg",
            ".svg", ".gif", ".woff2", ".wav", ".mp3", ".ogg", ".wasm"
        );

        while ((entry = zis.getNextEntry()) != null) {
            if (entry.isDirectory()) continue;
            String name = entry.getName();

            // Validate extension
            String ext = name.substring(name.lastIndexOf('.'));
            if (!allowedExtensions.contains(ext.toLowerCase())) {
                throw new IllegalArgumentException("Disallowed file type: " + ext);
            }

            if (name.endsWith("index.html")) hasIndex = true;

            // Upload to S3
            byte[] content = zis.readAllBytes();
            s3Service.uploadBytes(prefix + name, content, getMimeType(ext));
        }

        if (!hasIndex) throw new IllegalArgumentException("Zip must contain index.html");
    }

    return cloudFrontBaseUrl + "/" + prefix + "index.html";
}
```

- [ ] **`MediaController.java`** — add endpoint:

```java
@PostMapping("/api/admin/media/game-upload")
public GameUploadResponse uploadGame(@RequestParam("file") MultipartFile file) {
    String gameUrl = gameUploadService.uploadGameZip(file);
    return new GameUploadResponse(gameUrl);
}
```

---

### 2. Post Schema — Game Fields

Already in Phase 1 schema (`V3__create_posts.sql`):

```sql
game_url   TEXT,      -- CloudFront URL to index.html
game_type  VARCHAR(10) -- iframe | canvas | link
```

No additional migration needed.

---

### 3. Admin — Game Post Form

- [ ] When format = `embedded-game` is selected in the post form, show:
  - **Game type** selector: iframe (default), canvas, link
  - **Game URL** — either:
    - Manual URL input (for externally hosted games)
    - File upload dropzone (accepts `.zip`, max 50MB) → calls `/api/admin/media/game-upload` → auto-fills URL
  - **Thumbnail upload** — cover image for the games listing page (uses standard cover image field)
  - **Description** — TipTap editor for the game's article body (instructions, credits, etc.)

---

### 4. Frontend — Game Embed Component

- [ ] **`GameEmbed.tsx`** (`'use client'`) — `frontend/newsletter/src/components/games/GameEmbed.tsx`:

```typescript
interface Props {
  gameUrl: string;
  gameType: 'iframe' | 'canvas' | 'link';
  title: string;
}

export function GameEmbed({ gameUrl, gameType, title }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  if (gameType === 'link') {
    return (
      <a href={gameUrl} target="_blank" rel="noopener noreferrer" className={styles.playLink}>
        Play {title} →
      </a>
    );
  }

  return (
    <div ref={containerRef} className={styles.gameContainer}>
      {gameType === 'iframe' && (
        <iframe
          src={gameUrl}
          title={title}
          sandbox="allow-scripts allow-same-origin"
          allow="fullscreen"
          className={styles.gameFrame}
        />
      )}
      {gameType === 'canvas' && (
        <GameCanvas src={gameUrl} />
      )}
      <button onClick={toggleFullscreen} className={styles.fullscreenBtn}>
        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      </button>
    </div>
  );
}
```

- [ ] **`GameEmbed.module.scss`**:

```scss
.gameContainer {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.gameFrame {
  width: 100%;
  height: 100%;
  border: none;
}

.fullscreenBtn {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  background: rgba(0,0,0,0.7);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 200ms;

  .gameContainer:hover & { opacity: 1; }
}
```

---

### 5. Games Category Page

- [ ] **`/categories/games/page.tsx`** — server component:
  - Grid of game post cards, each with: thumbnail, title, "Play" button
  - Cards link to `/posts/[slug]` where the full game embed + article body renders
  - Game posts with `gameType: 'link'` show an external link icon

---

### 6. Security Considerations

- [ ] iframe `sandbox="allow-scripts allow-same-origin"` — prevents:
  - Form submission
  - Popups
  - Top-level navigation
  - Plugin access
- [ ] Games served from a separate CloudFront distribution (`games.evalieu.com`) to isolate origin
- [ ] Content-Security-Policy header on newsletter site: `frame-src games.evalieu.com`
- [ ] Zip extraction validates no path traversal (`../` in zip entry names rejected)

---

## Decisions & Notes

<!-- Record decisions made during implementation here -->
