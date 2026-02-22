import antfu from "@antfu/eslint-config";

export default antfu({
	react: true,
	typescript: true,
	stylistic: false,
	rules: {
		"node/prefer-global/process": "off",
		"unicorn/error-message": "off",
		"react/no-array-index-key": "warn",
	},
});
