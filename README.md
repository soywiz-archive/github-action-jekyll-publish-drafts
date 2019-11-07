# github-action-jekyll-publish-drafts

Explores the `_draft` folder of your jekyll repository, and publishes articles with the `date` frontmatter greater than the current time.

```
    steps:
    - uses: actions/checkout@v1
    - name: Jekyll Publish Drafts
      uses: soywiz/github-action-jekyll-publish-drafts@master
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        jekyll_path: ./docs
```

This is useful as a cron action. For example each hour:

```
  on:
    schedule:
      - cron: '*/60 * * * *'
```

This way you can create drafts that will be autopublished automatically.
