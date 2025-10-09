import './catalogue.css'

const products = [
  {
    id: 1,
    name: 'Classic Tee',
    price: '29.99',
    image: '/images/shirt_classic.png',
  },
  {
    id: 2,
    name: 'Hoodie Supreme',
    price: '49.99',
    image: '/images/hoodie_black.png',
  },
  {
    id: 3,
    name: 'Mint Cap',
    price: '19.99',
    image: '/images/cap_green.png',
  },
  {
    id: 4,
    name: 'Sport Edition Tee',
    price: '34.99',
    image: '/images/shirt_sport.png',
  },
]

export default function Catalogue() {
  return (
    <div className="catalogue-page">
      <header className="catalogue-header">
        <h1>Explore the StyleMint Collection</h1>
        <p>Choose your base — customize it your way.</p>
      </header>

      <div className="catalogue-grid">
        {products.map((item) => (
          <div className="product-card" key={item.id}>
            <div className="product-image">
              <img src={item.image} alt={item.name} />
            </div>
            <div className="product-info">
              <h2>{item.name}</h2>
              <p>${item.price}</p>
              <button className="customize-btn">
                Customize
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
