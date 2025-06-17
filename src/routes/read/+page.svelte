<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<svelte:head>
  <title>Finished Books</title>
</svelte:head>

<div>
  <h1>Finished Books</h1>
  
  <p>
    <strong>Last updated:</strong>
    {new Date(data.buildTime).toLocaleString()}
    (statically generated)
  </p>

  {#if data.books && data.books.length > 0}
    <div class="books-grid">
      {#each data.books as book}
        <div class="book-card">
          {#if book.cover}
            <img src={book.cover} alt="Cover of {book.title}" class="book-cover" />
          {/if}
          
          <div class="book-info">
            <h3>{book.title}</h3>
            {#if book.subtitle}
              <h4 class="subtitle">{book.subtitle}</h4>
            {/if}
            
            {#if book.authors && book.authors.length > 0}
              <p class="authors">
                by {book.authors.map(author => author.name).join(', ')}
              </p>
            {/if}
            
            {#if book.finishedDate}
              <p class="finish-date">
                Finished: {new Date(book.finishedDate).toLocaleDateString()}
              </p>
            {/if}
            
            {#if book.description}
              <p class="description">{book.description}</p>
            {/if}
            
            {#if book.slug}
              <a href="https://literal.club/book/{book.slug}" target="_blank" rel="noopener" class="literal-link">
                View on Literal →
              </a>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <p>No finished books found.</p>
  {/if}
</div>

<style>
  .books-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
  }

  .book-card {
    display: flex;
    flex-direction: column;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 1.5rem;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .book-cover {
    width: 120px;
    height: auto;
    border-radius: 4px;
    margin-bottom: 1rem;
    align-self: center;
  }

  .book-info h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .subtitle {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 400;
    color: #666;
    font-style: italic;
  }

  .authors {
    margin: 0 0 0.75rem 0;
    color: #555;
    font-weight: 500;
  }

  .finish-date {
    margin: 0 0 1rem 0;
    color: #007bff;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .description {
    margin: 0 0 1rem 0;
    color: #333;
    line-height: 1.5;
    flex-grow: 1;
  }

  .literal-link {
    color: #007bff;
    text-decoration: none;
    font-weight: 500;
    margin-top: auto;
  }

  .literal-link:hover {
    text-decoration: underline;
  }
</style>
