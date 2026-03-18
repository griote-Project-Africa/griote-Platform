const sequelize = require('../config/db.config');
const User           = require('./user.model');
const RefreshToken   = require('./refreshToken.model');
const Depot          = require('./depot.model');
const Document       = require('./document.model');
const Category       = require('./category.model');
const Tag            = require('./tag.model');
const Announcement   = require('./announcement.model');
const Article        = require('./article.model');
const Image          = require('./image.model');
const AnalyticsEvent = require('./analyticsEvent.model');

// === User ===
User.hasMany(RefreshToken, { foreignKey: 'user_id' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

// === Image (polymorphic — constraints:false car imageable_id peut pointer vers plusieurs tables) ===
User.hasMany(Image, { foreignKey: 'imageable_id', constraints: false, scope: { imageable_type: 'user' }, as: 'images' });
Image.belongsTo(User, { foreignKey: 'imageable_id', constraints: false, as: 'user' });

User.hasMany(Depot,        { foreignKey: 'owner_id', as: 'depots' });
Depot.belongsTo(User,      { foreignKey: 'owner_id', as: 'owner' });

User.hasMany(Announcement, { foreignKey: 'author_id' });
Announcement.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

User.hasMany(Article,      { foreignKey: 'author_id' });
Article.belongsTo(User,    { foreignKey: 'author_id', as: 'author' });

// === Category (shared) ===
Category.hasMany(Depot,    { foreignKey: 'category_id' });
Depot.belongsTo(Category,  { foreignKey: 'category_id', as: 'category' });

Category.hasMany(Article,  { foreignKey: 'category_id' });
Article.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// === Tag (shared) ===
Depot.belongsToMany(Tag, {
  through: 'depot_tags',
  foreignKey: 'depot_id',
  otherKey: 'tag_id',
  as: 'tags'
});
Tag.belongsToMany(Depot, {
  through: 'depot_tags',
  foreignKey: 'tag_id',
  otherKey: 'depot_id',
  as: 'depots'
});

Article.belongsToMany(Tag, {
  through: 'article_tags',
  foreignKey: 'article_id',
  otherKey: 'tag_id',
  as: 'tags'
});
Tag.belongsToMany(Article, {
  through: 'article_tags',
  foreignKey: 'tag_id',
  otherKey: 'article_id',
  as: 'articles'
});

// === Depot → Documents ===
Depot.hasMany(Document,    { foreignKey: 'depot_id', as: 'documents' });
Document.belongsTo(Depot,  { foreignKey: 'depot_id' });

module.exports = {
  sequelize,
  User,
  RefreshToken,
  Depot,
  Document,
  Category,
  Tag,
  Announcement,
  Article,
  Image,
  AnalyticsEvent,
};
