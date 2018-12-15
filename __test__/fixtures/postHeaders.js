const headerWithRootCategory = `
<div class="post-header">
  <div class="post-header__left">
    <div class="posts-title">
      <div class="post-header__upper">
        <span class="post-header__id">#12345</span>
        <ul class="category-path">
          <li class="category-path__item">
            <a class="category-path__link" href="/#path=%2F%E6%97%A5%E5%A0%B1">daily-report</a>
          </li>
          <li class="category-path__item">
            <a class="category-path__link" href="/#path=%2F%E6%97%A5%E5%A0%B1%2F2017">2017</a>
          </li>
          <li class="category-path__item">
            <a class="category-path__link" href="/#path=%2F%E6%97%A5%E5%A0%B1%2F2017%2F12">12</a>
          </li>
          <li class="category-path__item">
            <a class="category-path__link" href="/#path=%2F%E6%97%A5%E5%A0%B1%2F2017%2F12%2F11">11</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <ul class="post-meta post-header__meta">
    <li class="post-author"><div class="post-author__thumbnail">
      <a class="thumbnail__link" href="/members/hyoshihara04"><img class="thumbnail__image" src="icon-image-url">
      </a></div>
      <div class="post-author__info">
        <div class="post-author__user">
          Created by
          <a href="/members/hyoshihara04">hyoshihara04</a>
        </div>
        <div class="post-author__date">2018-12-02 15:20:56 +0900</div>
      </div>
    </li>
    <li class="post-author"><div class="post-author__thumbnail">
      <a class="thumbnail__link" href="/members/hyoshihara04"><img class="thumbnail__image" src="icon-image-url">
      </a></div>
      <div class="post-author__info">
        <div class="post-author__user">
          Updated by
          <a href="/members/hyoshihara04">hyoshihara04</a>
        </div>
        <div class="post-author__date">2018-12-02 15:20:56 +0900</div>
        <div class="post-author__change-log">
          <a class="post-author__change-log-link" href="/posts/12345/revisions/1">Create post.</a>
        </div>
      </div>
    </li>
  </ul>
</div>
`;

const headerWithoutRoot = `
<div class="post-header">
  <div class="post-header__left">
    <div class="posts-title">
      <div class="post-header__upper">
        <span class="post-header__id">#12345</span>
        <ul class="category-path">
          <li class="category-path__item">
            <a class="category-path__link" href="/#path=%2F2018">2018</a>
          </li>
          <li class="category-path__item">
            <a class="category-path__link" href="/#path=%2F2018%2F02">02</a>
          </li>
          <li class="category-path__item">
            <a class="category-path__link" href="/#path=%2F2018%2F02%2F16">16</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <ul class="post-meta post-header__meta">
    <li class="post-author"><div class="post-author__thumbnail">
      <a class="thumbnail__link" href="/members/hyoshihara04"><img class="thumbnail__image" src="icon-image-url">
      </a></div>
      <div class="post-author__info">
        <div class="post-author__user">
          Created by
          <a href="/members/hyoshihara04">hyoshihara04</a>
        </div>
        <div class="post-author__date">2018-03-13 23:36:39 +0900</div>
      </div>
    </li>
    <li class="post-author"><div class="post-author__thumbnail">
      <a class="thumbnail__link" href="/members/hyoshihara04"><img class="thumbnail__image" src="icon-image-url">
      </a></div>
      <div class="post-author__info">
        <div class="post-author__user">
          Updated by
          <a href="/members/hyoshihara04">hyoshihara04</a>
        </div>
        <div class="post-author__date">2018-03-13 23:49:45 +0900</div>
        <div class="post-author__change-log">
          <a class="post-author__change-log-link" href="/posts/12345/revisions/2">Update post.</a>
          <a class="post-author__change-log-link" href="/posts/12345/revisions/2/diff">(diff)</a>
        </div>
      </div>
    </li>
  </ul>
</div>
`;

export { headerWithRootCategory, headerWithoutRoot };
