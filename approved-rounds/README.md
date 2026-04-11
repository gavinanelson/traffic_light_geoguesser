# Approved Rounds

Railway deploys should treat this folder as the canonical source for playable global rounds.

Expected structure:

- `manifest.json`
- `images/<file>` for every approved image referenced by the manifest

The app reads `manifest.json` at runtime and serves files from this folder through
`/api/approved-rounds/...`.

Minimal manifest format:

```json
{
  "rounds": [
    {
      "id": "example-round",
      "filename": "images/example.jpg",
      "lat": 30.2672,
      "lng": -97.7431,
      "city": "Austin",
      "region": "Texas",
      "country": "USA"
    }
  ]
}
```

`filename` may also be `image`. Relative paths are preferred.
