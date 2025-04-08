// import Markdoc from '@markdoc/markdoc';

// /**
//  * @typedef {import('@markdoc/markdoc').Config} Config
//  * @typedef {import('@markdoc/markdoc').Node} Node
//  */

// // TODO: perhaps this additional attribute can be automatically added to all the Nodes, such taht we can set a custom component that works with normal markdown, without having to use Tags
// // ACTUALLY I THINK THE ATTRIBUTES SYNTAX DOES NOT WORK WITH IMAGE NODE, BECAUSE IMAGE IS INLINE, AND IT GETS WRAPPED WITH A PARAGRAPH, SO THE IMAGE + ATTRIBUTE SYNTAX ENDS UP JUST MAKING MARKDOC NOT TREAT IT AS AN IMAGE, SO PROBABLY WE SHOULD USE A CUSTOM IMAGE COMPONENT. AND SAID CUSTOM IMAGE COMPONENT CAN BE GIVEN THE ATTRBIUTES SYNTAX, FOR EXAMPLE {% component="CustomComponent" %}

// export const image = {
//   attributes: {
//     ...Markdoc.nodes.image.attributes,
//     hello: {
//       type: String,
//       required: false
//     }
//   },
//   /**
//    * @param {Node} node
//    * @param {Config} config
//    */
//   transform(node, config) {
//     const attributes = node.transformAttributes(config);
//     return new Markdoc.Tag('img', {
//       ...attributes,
//       component: attributes.component || ''
//     });
//   }
// };

// export default image;
